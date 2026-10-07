import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Server-side exponential backoff rate limiter ───────────
  const secured = useSecuredCountdown();
  const isLocked = secured.locked;

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
      // ── Delegate to server-side rate limiter Edge Function ──
      const result = await secured.retry(sanitizedEmail, password);

      if (result.success && result.user && result.session?.accessToken) {
        // ── Successful login — restore Supabase session from Edge Function ──
        // The Edge Function authenticated on its own client, so we need to
        // set the session on the local Supabase client for AuthContext to work.
        await supabase.auth.setSession({
          access_token: result.session.accessToken,
          refresh_token: result.session.refreshToken || "",
        });

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
    <div className="w-full h-screen flex justify-center items-center bg-[#0F2744]">
      {/* Original Card Layout - Reverted to Previous Design */}
      <div className="w-full max-w-[400px] bg-white p-8 rounded-lg shadow-md">
        {/* Lockout Overlay - Shown when locked, but maintains original layout underneath */}
        {isLocked && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>

              {secured.isPermanentlyBanned ? (
                <>
                  <p className="text-xl font-bold text-red-600 mb-2">
                    Device Permanently Locked
                  </p>
                  <p className="text-sm text-red-600">
                    This device has been permanently locked due to excessive failed login attempts.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-red-600 mb-2">
                    Login Temporarily Suspended
                  </p>
                  <p className="text-sm text-red-600">
                    Too many consecutive failed login attempts. Further attempts blocked for:
                  </p>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-mono">
                    {secured.formatted}
                  </span>
                </>
              )}

              {secured.tier > 0 && (
                <p className="text-sm text-red-600">
                  Security Level {secured.tier}/5
                </p>
              )}

              <p className="text-xs text-red-600">
                Please wait or contact administrator
              </p>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Logo" className="w-[100px] h-[100px]" />
          </div>
          <h2 className="text-2xl font-extrabold mb-8 text-center"><span className="text-[#e7600d]">CAM</span><span className="text-[#243c56]">OTE</span></h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4 relative">
              <UserIcon
                className="text-[#7E8998] absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
              />
              <input
                className={cn(
                  "w-full h-11 bg-[#F0F4F8] border border-[#E2E8F0] rounded-md pl-11 pr-4 text-gray-700 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#e7600d]/50 focus:border-[#e7600d] shadow-sm",
                  isLocked && "opacity-50 cursor-not-allowed",
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
                disabled={isLocked || submitting}
              />
            </div>

            <div className="relative">
              <LockClosedIcon
                className="text-[#7E8998] absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
              />
              <input
                className={cn(
                  "w-full h-11 bg-[#F0F4F8] border border-[#E2E8F0] rounded-md pl-11 pr-4 text-gray-700 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#e7600d]/50 focus:border-[#e7600d] shadow-sm",
                  isLocked && "opacity-50 cursor-not-allowed",
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
                disabled={isLocked || submitting}
              />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-gray-600 hover:text-gray-800"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked || submitting}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" cursor="pointer" />
                ) : (
                  <EyeIcon className="h-5 w-5" cursor="pointer" />
                )}
              </button>
            </div>

            {error && (
              <div className="mt-2 flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="text-right mt-4">
              <a
                href="/forgot-password"
                className="text-sm text-[#0F2744] hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0F2744] text-white py-2 px-4 rounded-md hover:bg-[#0F2744]/90 focus:outline-none focus:ring-2 focus:ring-[#e7600d] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={submitting || isLocked}
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}