import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, CheckCircle2, X } from "lucide-react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/solid";
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
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const passwordRequirements = [
    [password.length >= 8, "At least 8 characters"],
    [/[A-Z]/.test(password), "1 capital letter"],
    [/[a-z]/.test(password), "1 small letter"],
    [/[0-9]/.test(password), "1 number"],
    [/[!@#$%^&*(),.?":{}|<>_\[\]\\/'`~;+=-]/.test(password), "1 special character"],
  ];
  const passwordIsValid = passwordRequirements.every(([valid]) => valid);

  useEffect(() => {
    const validateInvite = async () => {
      const token = params.get("token");
      if (!token) { setError("This activation link is invalid."); setLoading(false); return; }
      try {
        const tokenHash = await hashInviteToken(token);
        const { data, error: inviteError } = await supabase.from("user_auth_invites").select("*").eq("invite_token_hash", tokenHash).maybeSingle();
        if (inviteError) throw inviteError;
        if (!data || data.used_at) throw new Error("Invalid activation link.");
        if (!data.expires_at || new Date(data.expires_at) < new Date()) throw new Error("This activation link has expired.");
        setInvite({ ...data, tokenHash });
      } catch (validationError) { setError(validationError.message || "Unable to validate this activation link."); } finally { setLoading(false); }
    };
    validateInvite();
  }, [params]);

  const validatePassword = (value) => {
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(value)) return "Password must include at least 1 capital letter.";
    if (!/[a-z]/.test(value)) return "Password must include at least 1 small letter.";
    if (!/[0-9]/.test(value)) return "Password must include at least 1 number.";
    if (!/[!@#$%^&*(),.?":{}|<>_\[\]\\/'`~;+=-]/.test(value)) return "Password must include at least 1 special character.";
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = password !== confirmPassword ? "Passwords do not match." : "";
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    if (nextPasswordError || nextConfirmPasswordError) return;
    setSubmitting(true); setError("");
    try {
      await activateProfileAccount({ token: params.get("token"), password });
      setSuccess(true);
    } catch (submitError) { setError(submitError.message || "Failed to activate account."); } finally { setSubmitting(false); }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
      <div className="min-h-[500px] w-full max-w-md rounded-lg bg-white p-10 shadow-xl">
        <div className="mb-10 flex items-center justify-center gap-5">
          <div className="w-[190px] shrink-0">
            <h1 className="text-right text-4xl font-black tracking-tight" style={{ fontFamily: '"TT Hoves", sans-serif' }}>
              <span className="italic text-orange-500">CAM</span>
              <span className="ml-[3px] text-[#243c56]">OTE</span>
            </h1>
            <div className="mt-2 ml-auto flex w-[88%] flex-col items-end gap-1" aria-hidden="true">
              <span className="h-1.5 w-[105px] bg-[#243c56]" />
              <span className="h-1.5 w-[67px] bg-orange-500" />
            </div>
          </div>
          <img src={Logo} alt="CAMOTE road and aperture logo" className="mt-[5px] h-[68px] w-[68px] shrink-0 object-contain" />
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-[#8693A6]">Verifying your invitation...</p>
        ) : success ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="text-xl font-semibold text-[#0F2744]">Account activated</h2>
            <p className="text-sm text-[#607085]">Your CAMOTE account is ready. You can now sign in.</p>
            <Link to="/login" className="block rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            )}
            <div>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="activation-email" aria-label="Email" placeholder="Email" value={invite?.email || ""} disabled className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50/80 px-3 pl-11 text-sm font-medium tracking-wide text-slate-700 placeholder:font-normal placeholder:text-slate-400 shadow-sm" />
              </div>
            </div>
            <div>
              <div className="relative mt-1">
                <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="activation-password" aria-label="Password" placeholder="Password" required minLength="8" type={showPassword ? "text" : "password"} value={password} onChange={(event) => { const nextPassword = event.target.value; setPassword(nextPassword); setPasswordError(nextPassword ? validatePassword(nextPassword) : ""); setConfirmPasswordError(confirmPassword && nextPassword !== confirmPassword ? "Passwords do not match." : ""); }} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 pl-11 pr-10 text-sm font-medium tracking-wide text-slate-700 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer text-slate-400 transition-colors hover:text-slate-700" aria-label="Toggle password visibility">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                {passwordRequirements.map(([valid, label]) => (
                  <p key={label} className={valid ? "flex items-center gap-1 text-emerald-600" : "flex items-center gap-1 text-slate-400"}>
                    {valid ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {label}
                  </p>
                ))}
              </div>
              <p className="min-h-5 text-xs text-red-600">{passwordError}</p>
            </div>
            <div>
              <div className="relative mt-1">
                <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="activation-confirm-password" aria-label="Confirm password" placeholder="Confirm password" required minLength="8" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(event) => { const nextConfirmPassword = event.target.value; setConfirmPassword(nextConfirmPassword); setConfirmPasswordError(nextConfirmPassword && nextConfirmPassword !== password ? "Passwords do not match." : ""); }} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 pl-11 pr-10 text-sm font-medium tracking-wide text-slate-700 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 cursor-pointer text-slate-400 transition-colors hover:text-slate-700" aria-label="Toggle confirm password visibility">
                  {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <p className="min-h-5 text-xs text-red-600">{confirmPasswordError}</p>
            </div>
            <button disabled={submitting || !invite || !passwordIsValid || password !== confirmPassword} type="submit" className="mt-6 w-full cursor-pointer rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F2744]/90 focus:outline-none focus:ring-2 focus:ring-[#e7600d] focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Activating..." : "Activate Account"}
            </button>
            <p className="flex items-center justify-center gap-1 text-xs text-[#8693A6]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              Secured by CAMOTE
            </p>
          </form>
        )}
      </div>
    </main>
  );
}