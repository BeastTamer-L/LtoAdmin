import emailjs from "@emailjs/browser";
import { supabase } from "../supabaseClient";

const INVITE_LIFETIME_MS = 24 * 60 * 60 * 1000;

const getRequiredEnv = (name) => {
  const value = import.meta.env[name];
  if (!value) throw new Error(`Missing ${name} configuration.`);
  return value;
};

const getFunctionUrl = (name) => `${getRequiredEnv("VITE_SUPABASE_URL")}/functions/v1/${name}`;

const createToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const hashInviteToken = async (token) => {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const createEmployeeInviteAndSendEmail = async ({
  userId,
  email,
  toName,
  role,
}) => {
  const token = createToken();
  const tokenHash = await hashInviteToken(token);
  const expiresAt = new Date(Date.now() + INVITE_LIFETIME_MS).toISOString();

  const { error: revokeError } = await supabase
    .from("user_auth_invites")
    .update({ expires_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null);

  if (revokeError) throw revokeError;

  const { error: inviteError } = await supabase
    .from("user_auth_invites")
    .insert({
      user_id: userId,
      email: email.trim().toLowerCase(),
      invite_token_hash: tokenHash,
      expires_at: expiresAt,
    });

  if (inviteError) throw inviteError;

  const activationLink = `${window.location.origin}/activate-account?token=${encodeURIComponent(token)}`;
  const serviceId = getRequiredEnv("VITE_EMAILJS_SERVICE_ID");
  const templateId = getRequiredEnv("VITE_EMAILJS_TEMPLATE_ID");
  const publicKey = getRequiredEnv("VITE_EMAILJS_PUBLIC_KEY");

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email.trim().toLowerCase(),
        to_name: toName || "User",
        role: role || "enforcer",
        activation_link: activationLink,
      },
      { publicKey },
    );
  } catch (error) {
    await supabase.from("user_auth_invites").delete().eq("invite_token_hash", tokenHash);
    throw error;
  }

  return { activationLink, expiresAt };
};

export const createProfileAccount = async ({
  firstName,
  middleName,
  lastName,
  email,
  phoneNumber,
  badgeNumber,
  position,
  role,
  birthdate = null,
  avatarPath = null,
  deviceCode = null,
}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Your admin session has expired. Please sign in again.");
  }

  const response = await fetch(getFunctionUrl("admin-create-user"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      badgeNumber,
      position,
      role,
      birthdate,
      avatarPath,
      deviceCode,
    }),
  });

  let payload = null;
  try { payload = await response.json(); } catch { /* ignore invalid error bodies */ }
  if (!response.ok || !payload?.success) {
    console.error(
      "admin-create-user failed:",
      "status=",
      response.status,
      "error=",
      payload?.error,
      "stage=",
      payload?.stage,
      "details=",
      payload?.details,
    );
    const stage = payload?.stage ? ` [${payload.stage}]` : "";
    const details = payload?.details ? `: ${payload.details}` : "";
    throw new Error(`${payload?.error || `Account creation failed (HTTP ${response.status}).`}${stage}${details}`);
  }

  return payload.profile;
};

export const activateProfileAccount = async ({ token, password }) => {
  const response = await fetch(getFunctionUrl("activate-user-account"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  let payload = null;
  try { payload = await response.json(); } catch { /* ignore invalid error bodies */ }
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || "Failed to activate the account.");
  }
};