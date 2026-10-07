import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, ShieldCheck, XCircle } from "lucide-react";
import { supabase } from "../supabaseClient";
import { activateProfileAccount, hashInviteToken } from "../lib/userInvites";
import Logo from "../assets/logo.png";

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateInvite = async () => {
      const token = params.get("token");
      if (!token) { setError("This activation link is invalid."); setLoading(false); return; }
      try {
        const tokenHash = await hashInviteToken(token);
        const { data, error: inviteError } = await supabase.from("user_auth_invites").select("*").eq("invite_token_hash", tokenHash).maybeSingle();
        if (inviteError) throw inviteError;
        if (!data || data.used_at) throw new Error("This activation link is invalid or has already been used.");
        if (!data.expires_at || new Date(data.expires_at) < new Date()) throw new Error("This activation link has expired.");
        setInvite({ ...data, tokenHash });
      } catch (validationError) { setError(validationError.message || "Unable to validate this activation link."); } finally { setLoading(false); }
    };
    validateInvite();
  }, [params]);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setSubmitting(true); setError("");
    try {
      await activateProfileAccount({ token: params.get("token"), password });
      setSuccess(true);
    } catch (submitError) { setError(submitError.message || "Failed to activate account."); } finally { setSubmitting(false); }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[#0F2744] px-4 py-10"><div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl"><div className="mb-6 text-center"><img src={Logo} alt="CAMOTE" className="mx-auto h-20 w-20 object-contain" /><h1 className="mt-3 text-2xl font-bold text-[#243c56]"><span className="text-[#e7600d]">CAM</span>OTE</h1><p className="mt-1 text-sm text-[#8693A6]">Traffic Monitoring System</p></div>{loading ? <p className="py-8 text-center text-sm text-[#8693A6]">Verifying your invitation...</p> : success ? <div className="space-y-4 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h2 className="text-xl font-semibold text-[#0F2744]">Account activated</h2><p className="text-sm text-[#607085]">Your CAMOTE account is ready. You can now sign in.</p><Link to="/login" className="block rounded-md bg-[#ED6704] px-4 py-3 text-sm font-semibold text-white">Go to Login</Link></div> : <form onSubmit={submit} className="space-y-4">{error && <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><XCircle className="h-5 w-5 shrink-0" />{error}</div>}<label className="block text-sm text-[#202020]">Email<input value={invite?.email || ""} disabled className="mt-1 h-10 w-full rounded-md border border-[#DCE3EB] bg-[#F0F4F8] px-3 text-[#607085]" /></label><label className="block text-sm text-[#202020]">Password<div className="relative mt-1"><input required minLength="8" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-md border border-[#DCE3EB] px-3 pr-10 outline-none focus:border-[#0F2744]" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-[#8693A6]" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label><label className="block text-sm text-[#202020]">Confirm password<div className="relative mt-1"><input required minLength="8" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-10 w-full rounded-md border border-[#DCE3EB] px-3 pr-10 outline-none focus:border-[#0F2744]" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-[#8693A6]" aria-label="Toggle confirm password visibility">{showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label><button disabled={submitting || !invite} type="submit" className="w-full rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Activating..." : "Activate Account"}</button><p className="flex items-center justify-center gap-1 text-xs text-[#8693A6]"><ShieldCheck className="h-4 w-4" /> Secured by CAMOTE</p></form>}</div></main>;
}