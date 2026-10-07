import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const hashToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Function is not configured." }, 500);

    const { token, password } = await request.json();
    if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
      return json({ error: "A valid activation token and password are required." }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const tokenHash = await hashToken(token);
    const { data: invite, error: inviteError } = await adminClient
      .from("user_auth_invites")
      .select("user_id, email, expires_at, used_at")
      .eq("invite_token_hash", tokenHash)
      .maybeSingle();
    if (inviteError) return json({ error: inviteError.message }, 400);
    if (!invite || invite.used_at) return json({ error: "This activation link is invalid or has already been used." }, 400);
    if (!invite.expires_at || new Date(invite.expires_at) < new Date()) return json({ error: "This activation link has expired." }, 400);

    const { error: authError } = await adminClient.auth.admin.updateUserById(invite.user_id, { password });
    if (authError) return json({ error: authError.message }, 400);

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ is_active: true, account_status: "active" })
      .eq("id", invite.user_id);
    if (profileError) return json({ error: profileError.message }, 400);

    const { error: usedError } = await adminClient
      .from("user_auth_invites")
      .update({ used_at: new Date().toISOString() })
      .eq("invite_token_hash", tokenHash);
    if (usedError) return json({ error: usedError.message }, 400);

    return json({ success: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
