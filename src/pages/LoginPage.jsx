import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import Logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { cn } from '../../lib/utils';
import { sanitizeEmail } from '../../lib/security/sanitize';
import { useSecuredCountdown } from '../../lib/security/useSecuredCountdown';

const GENERIC_AUTH_ERROR = "Invalid email or password.";

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // ── Server-side exponential backoff rate limiter ───────────
  const secured = useSecuredCountdown();
  const isLocked = secured.locked;
  const lockoutActive = isLocked && (secured.isPermanentlyBanned || lockoutSeconds > 0 || secured.secondsLeft > 0);

  useEffect(() => {
    if (isLocked) setError('');
    if (!isLocked || secured.isPermanentlyBanned) {
      setLockoutSeconds(0);
      return undefined;
    }

    setLockoutSeconds(Math.max(0, secured.secondsLeft));
    const intervalId = window.setInterval(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isLocked, secured.isPermanentlyBanned, secured.secondsLeft]);

  // Restore lockout from server on mount and when email field loses focus
  // (handles page refresh while locked — server is the source of truth)
  // Debounced to avoid spamming the server on every keystroke.
  const restoreTimeoutRef = useRef(null);
  const handleEmailBlur = useCallback(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
    restoreTimeoutRef.current = window.setTimeout(() => {
      secured.restoreLockout(trimmed);
    }, 300);
  }, [email, secured.restoreLockout]);

  // On mount: check if this IP is locked out (no email needed).
  // This blocks the page immediately — attacker can't even see the form.
  useEffect(() => {
    (async () => {
      const result = await secured.checkIpLockout();
      if (result.locked && result.retryAfterMs > 0) {
        secured.startCountdown(result.retryAfterMs);
        // We don't have the email yet, so suppress the email-specific
        // lockout message — the IP-level message is shown instead.
      }
    })();
    return () => {
      if (restoreTimeoutRef.current) clearTimeout(restoreTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user) {
    return <Navigate to="/violations" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Sanitize email input before any processing
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.role?.toLowerCase() === 'enforcer') {
        setError(GENERIC_AUTH_ERROR);
        return;
      }

      // ── Delegate to server-side rate limiter Edge Function ──
      const result = await secured.retry(sanitizedEmail, password);

      if (result.success && result.user && result.session?.accessToken) {
        // ── Successful login — restore Supabase session from Edge Function ──
        // The Edge Function authenticated on its own client, so we need to
        // set the session on the local Supabase client for AuthContext to work.
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.accessToken,
          refresh_token: result.session.refreshToken || "",
        });
        if (sessionError) throw sessionError;

        // Now the local Supabase client has a valid session.
        // Let AuthContext pick it up by navigating.
        navigate("/", { replace: true });
        return;
      }

      // ── Failed login (locked or auth error) ────────────────
      setError(result.error || GENERIC_AUTH_ERROR);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-[#1E3A8A] px-4 py-8">
      {/* Original Card Layout - Reverted to Previous Design */}
      <div className="w-full max-w-[400px] rounded-lg bg-white p-8 shadow-xl">
        <div className="relative">
          <div className="flex translate-y-1 items-center justify-center gap-3">
            <div className="w-[180px] shrink-0">
              <h2 className="text-right text-4xl font-black tracking-tight" style={{ fontFamily: '"TT Hoves", sans-serif' }}>
                <span className="italic text-orange-500">CAM</span>
                <span className="ml-[3px] text-[#1E3A8A]">OTE</span>
              </h2>
              <div className="mt-2 ml-auto flex w-[88%] flex-col items-end gap-1" aria-hidden="true">
                <span className="h-1.5 w-[105px] bg-[#1E3A8A]" />
                <span className="h-1.5 w-[67px] bg-orange-500" />
              </div>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#1E3A8A]">
              <img src={Logo} alt="CAMOTE road and aperture logo" className="h-16 w-16 object-contain" />
            </div>
          </div>
          <p className="mb-8 mt-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            A Simulated LTO Environment
          </p>
          {lockoutActive ? (
            <section className="flex min-h-[300px] flex-col items-center justify-center rounded-xl px-6 text-center" aria-live="polite">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                <LockClosedIcon className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {secured.isPermanentlyBanned ? 'Access Permanently Suspended' : 'Access Temporarily Suspended'}
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                {secured.isPermanentlyBanned
                  ? 'This device has been suspended due to repeated failed sign-in attempts.'
                  : 'Too many failed sign-in attempts. Please wait for the security timer to expire before trying again.'}
              </p>
              {!secured.isPermanentlyBanned && (
                <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 shadow-inner">
                  <span className="font-mono text-2xl font-bold tracking-widest text-orange-500">
                    {String(Math.floor(lockoutSeconds / 60)).padStart(2, '0')}:{String(lockoutSeconds % 60).padStart(2, '0')}
                  </span>
                </div>
              )}
            </section>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="-mb-1 flex h-14 items-center gap-2 pl-3" aria-live="polite">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={cn("size-5 shrink-0 text-red-500", !error && "invisible")}
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
              <p className={cn("text-sm text-red-600", !error && "invisible")}>{error || "Error message placeholder"}</p>
            </div>

            <div className="mb-4 relative">
              <UserIcon
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              />
              <input
                className={cn(
                    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-medium tracking-wide text-slate-700 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                  lockoutActive && "opacity-50 cursor-not-allowed",
                  submitting && "opacity-70"
                )}
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onBlur={handleEmailBlur}
                disabled={lockoutActive || submitting}
              />
            </div>

            <div className="relative">
              <LockClosedIcon
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              />
              <input
                className={cn(
                    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-medium tracking-wide text-slate-700 shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20",
                  lockoutActive && "opacity-50 cursor-not-allowed",
                  submitting && "opacity-70"
                )}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={lockoutActive || submitting}
              />
              <button type="button"
                className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
                onClick={() => setShowPassword(!showPassword)}
                disabled={lockoutActive || submitting}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" cursor="pointer" />
                ) : (
                  <EyeIcon className="h-5 w-5" cursor="pointer" />
                )}
              </button>
            </div>

            {/* Forgot password is switched off for now
            <div className="mt-2 text-right">
              <a
                href="/forgot-password"
                className="text-sm text-[#1E3A8A] hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            */}

            <button
              type="submit"
              className="mt-6 w-full cursor-pointer rounded-md bg-[#1E3A8A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A8A]/90 focus:outline-none focus:ring-2 focus:ring-[#e7600d] focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || lockoutActive}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
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
      </div>

      {/* Disclaimer banner under the card */}
      <div role="note" className="w-full max-w-[400px] rounded-lg border border-white/20 bg-white/10 px-5 py-4 text-center text-xs leading-relaxed text-white/90 backdrop-blur-sm">
        CAMOTE's Simulated LTO Environment operates on an independent, secure online database cloud (via Supabase) strictly for testing and simulation purposes. This system is 100% isolated and has no direct network connection, API links, or data synchronization with the live systems of the Land Transportation Office (LTO) or the Department of Transportation (DOTr). All real volunteer records are managed independently with explicit user consent.
      </div>
    </div>
  );
}