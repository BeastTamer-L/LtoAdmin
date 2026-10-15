import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Check, X } from "lucide-react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Logo from "../assets/logo.png";

const GENERIC_ERROR = "Unable to process your request. Please try again.";
const RESEND_COOLDOWN_SECONDS = 30;

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-medium tracking-wide text-slate-700 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [passcodeExpiresAt, setPasscodeExpiresAt] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const otpInputRefs = useRef([]);

  const passwordRequirements = [
    [password.length >= 8, "At least 8 characters"],
    [/[A-Z]/.test(password), "1 capital letter"],
    [/[a-z]/.test(password), "1 small letter"],
    [/[0-9]/.test(password), "1 number"],
    [/[!@#$%^&*(),.?":{}|<>_\[\]\\/'`~;+=-]/.test(password), "1 special character"],
  ];
  const passwordIsValid = passwordRequirements.every(([valid]) => valid);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const intervalId = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [resendSeconds]);

  useEffect(() => {
    if (!passcodeExpiresAt) return undefined;
    const intervalId = window.setInterval(() => {
      if (Date.now() >= passcodeExpiresAt) {
        setError("Your verification code has expired. Please request a new one.");
        setStep("otp");
        window.clearInterval(intervalId);
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [passcodeExpiresAt]);

  const sendCode = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const { error: requestError } = await supabase.functions.invoke("password-reset", {
        body: { action: "send", email: normalizedEmail },
      });
      if (requestError) throw requestError;
      setEmail(normalizedEmail);
      setPasscodeExpiresAt(Date.now() + 10 * 60 * 1000);
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setStep("otp");
    } catch (sendError) {
      console.error("Password reset email error:", sendError);
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (resendSeconds > 0 || submitting) return;
    await sendCode({ preventDefault: () => {} });
  };

  const updateCodeDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextCode = code.padEnd(4, " ").split("");
    nextCode[index] = digit;
    setCode(nextCode.join(""));
    setError("");
    if (digit && index < 3) otpInputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (event, index) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (event) => {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    setCode(pastedCode.padEnd(4, " "));
    setError("");
    otpInputRefs.current[Math.min(pastedCode.length, 3)]?.focus();
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(code)) {
      setError("Enter the 4-digit verification code.");
      return;
    }
    const { error: verifyError } = await supabase.functions.invoke("password-reset", {
      body: { action: "verify", email, code },
    });
    if (verifyError) {
      setError(verifyError.message || "That verification code is invalid. Please try again.");
      return;
    }
    setStep("reset");
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    if (!passwordIsValid) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.functions.invoke("password-reset", {
        body: { action: "reset", email, newPassword: password, code },
      });
      if (resetError) throw resetError;
      setStep("success");
    } catch (resetError) {
      console.error("Password reset error:", resetError);
      setError("Password reset is unavailable right now. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetToEmail = () => {
    setStep("email");
    setCode("");
    setError("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-8 flex items-center justify-center gap-4">
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

        {step === "email" && (
          <form onSubmit={sendCode} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter your enforcer email address to receive a 4-digit OTP verification code.</p>
            </div>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true">
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
              <input aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className={`${inputClassName} pl-11`} required />
            </div>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full cursor-pointer rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F2744]/90 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Sending..." : "Send Verification Code"}</button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-[#243c56] hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Back to Sign In</Link>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyCode} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verify Your Code</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">We sent a 4-digit verification code to <span className="font-medium text-slate-700">{email}</span>.</p>
            </div>
            <div className="flex justify-center gap-3" onPaste={handleCodePaste}>
              {Array.from({ length: 4 }, (_, index) => (
                <input
                  key={index}
                  ref={(element) => { otpInputRefs.current[index] = element; }}
                  aria-label={`Verification digit ${index + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] === " " ? "" : code[index] || ""}
                  onChange={(event) => updateCodeDigit(index, event.target.value)}
                  onKeyDown={(event) => handleCodeKeyDown(event, index)}
                  className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50/80 text-center font-mono text-2xl font-bold text-slate-700 shadow-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  required
                />
              ))}
            </div>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full cursor-pointer rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F2744]/90 disabled:cursor-not-allowed disabled:opacity-60">Verify Code</button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={resendCode} disabled={resendSeconds > 0 || submitting} className="cursor-pointer text-[#243c56] hover:text-orange-500 disabled:cursor-not-allowed disabled:text-slate-400">{resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend Code"}</button>
              <button type="button" onClick={resetToEmail} className="cursor-pointer text-slate-500 hover:text-slate-800">Change Email</button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={resetPassword} className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create New Password</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Choose a new password with at least 8 characters.</p>
            </div>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input aria-label="New password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className={`${inputClassName} pl-11 pr-11`} required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 cursor-pointer text-gray-600 hover:text-gray-800" aria-label="Toggle new password visibility">{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {passwordRequirements.map(([valid, label]) => (
                <p key={label} className={valid ? "flex items-center gap-1 text-emerald-600" : "flex items-center gap-1 text-slate-400"}>
                  {valid ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {label}
                </p>
              ))}
            </div>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input aria-label="Confirm new password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className={`${inputClassName} pl-11 pr-11`} required minLength={8} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 cursor-pointer text-gray-600 hover:text-gray-800" aria-label="Toggle confirm password visibility">{showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
            </div>
            <p className="min-h-5 text-sm text-red-600">{confirmPassword && confirmPassword !== password ? "Passwords do not match." : ""}</p>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <button type="submit" disabled={submitting || !passwordIsValid || password !== confirmPassword} className="w-full cursor-pointer rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F2744]/90 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900">Password Reset Complete</h2>
            <p className="text-sm leading-6 text-slate-500">Your password has been successfully updated. You can now sign in with your new credentials.</p>
            <Link to="/login" className="block w-full rounded-md bg-[#0F2744] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0F2744]/90">Return to Sign In</Link>
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-1 text-xs text-[#8693A6]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
          </svg>
          Secured by CAMOTE
        </p>
      </div>
    </main>
  );
}
