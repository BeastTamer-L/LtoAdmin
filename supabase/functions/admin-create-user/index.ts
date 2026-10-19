import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: "Function is not configured." }, 500);

    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Authentication is required." }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) return json({ error: "Authentication is required." }, 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", caller.id)
      .single();
    if (profileError || !callerProfile?.is_active || !["admin", "superadmin"].includes(callerProfile.role)) {
      return json({ error: "Only active administrators can create accounts." }, 403);
    }

    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const middleName = String(body.middleName || "").trim() || null;
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phoneNumber = String(body.phoneNumber || "").trim() || null;
    const badgeNumber = String(body.badgeNumber || "").trim() || null;
    const position = String(body.position || "").trim() || null;
    const allowedRoles = ["superadmin", "admin", "staff", "enforcer"];
    const role = allowedRoles.includes(body.role) ? body.role : "enforcer";
    const buddyId = String(body.buddyId || "").trim() || null;

    const deviceCode =
      role === "enforcer"
        ? String(body.deviceCode ?? "").trim()
        : null;

    if (role === "enforcer" && !/^[0-9]{4}$/.test(deviceCode ?? "")) {
      return json({
        error: "An enforcer must have a device code containing exactly 4 digits.",
        stage: "validate-device-code",
      }, 400);
    }
    if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email)) {
      return json({ error: "First name, last name, and a valid email are required." }, 400);
    }

    if (buddyId) {
      const { data: buddy, error: buddyError } = await adminClient
        .from("profiles")
        .select("id")
        .eq("id", buddyId)
        .eq("role", "enforcer")
        .maybeSingle();

      if (buddyError) {
        return json({ error: buddyError.message, stage: "validate-buddy" }, 400);
      }
      if (!buddy) {
        return json({ error: "Buddy assignment must reference an existing enforcer." }, 400);
      }
    }

    const { data: existingProfile, error: existingProfileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingProfileError) {
      return json({
        error: existingProfileError.message,
        stage: "check-existing-profile",
        code: existingProfileError.code || null,
      }, 400);
    }
    if (existingProfile) {
      return json({
        error: "An account with this email already exists.",
        stage: "check-existing-profile",
        code: "profile_email_exists",
      }, 409);
    }

    if (deviceCode) {
  const { data: assignedDevice, error: deviceCheckError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("device_code", deviceCode)
    .maybeSingle();

  if (deviceCheckError) {
    return json({
      error: deviceCheckError.message,
      stage: "check-device-code",
    }, 400);
  }

  if (assignedDevice) {
    return json({
      error: "This device code is already assigned to another enforcer.",
      stage: "check-device-code",
    }, 409);
  }
}

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, role },
    });
    if (authError) {
      console.error("admin-create-user auth.createUser failed:", authError);
      return json({
        error: authError.message,
        stage: "create-auth-user",
        code: authError.code || null,
      }, 400);
    }

    const { data: profile, error: insertError } = await adminClient
      .from("profiles")
      .upsert({
        id: authData.user.id,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        badge_number: badgeNumber,
        device_code: deviceCode,
        buddy_id: buddyId,
        position,
        role,
        is_active: true,
        account_status: "active",
        created_by: caller.id,
      }, { onConflict: "id" })
      .select("id, first_name, middle_name, last_name, email, role, device_code")
      .single();
    if (insertError) {
      console.error("admin-create-user profiles insert failed:", insertError);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return json({
        error: insertError.message,
        stage: "insert-profile",
        code: insertError.code || null,
        details: insertError.details || null,
      }, 400);
    }

    return json({ success: true, profile });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
