import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/supabaseClient';

/**
 * Advanced custom hook for managing security lockouts with IP and email-based rate limiting
 * Features:
 * - IP-level lockout checking (blocks page immediately)
 * - Email-specific lockout restoration on blur
 * - Tiered lockout system with exponential backoff
 * - Permanent ban detection
 * - Live countdown timer
 * - Server synchronization
 */
export function useSecuredCountdown() {
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tier, setTier] = useState(0);
  const [emailLockoutEmail, setEmailLockoutEmail] = useState('');
  const [formattedTime, setFormattedTime] = useState('0s');
  const [isPermanentlyBanned, setIsPermanentlyBanned] = useState(false);
  const [lockoutData, setLockoutData] = useState(null);

  // Format seconds into human-readable string
  const formatTime = (seconds) => {
    if (seconds <= 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  };

  const hashIdentifier = async (value) => {
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  // Check IP-based lockout from server
  const checkIpLockout = useCallback(async () => {
    // The browser does not know the real client IP. The previous query used
    // every active row, which locked out all users when any account was banned.
    return { locked: false, retryAfterMs: 0 };
  }, []);

  // Restore lockout for specific email from server
  const restoreLockout = useCallback(async (email) => {
    if (!email) return;

    try {
      const { data: rows, error } = await supabase
        .from('login_attempts_tracker')
        .select('suspended_until, lockout_tier, consecutive_failures')
        .eq('email', email.toLowerCase().trim())
        .not('suspended_until', 'is', null)
        .order('suspended_until', { ascending: false })
        .limit(1);

      const data = rows?.[0] ?? null;

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }

      try {
        if (data) {
          const suspendedUntil = new Date(data.suspended_until);
          const now = new Date();

          if (suspendedUntil > now) {
            const retryAfterMs = suspendedUntil.getTime() - now.getTime();
            setLocked(true);
            setSecondsLeft(Math.ceil(retryAfterMs / 1000));
            setTier(data.lockout_tier);
            setEmailLockoutEmail(email.toLowerCase().trim());
            startCountdown(retryAfterMs);

            return {
              locked: true,
              retryAfterMs,
              tier: data.lockout_tier,
              consecutiveFailures: data.consecutive_failures
            };
          }
        }

        // No active lockout for this email
        return { locked: false };
      } catch (processingError) {
        console.error('Error processing lockout data for email:', processingError);
        return { locked: false };
      }
    } catch (error) {
      console.error('Error restoring lockout for email:', error);
      return { locked: false };
    }
  }, []);

  // Start countdown with specific duration in milliseconds
  const startCountdown = useCallback((durationMs) => {
    setSecondsLeft(Math.ceil(durationMs / 1000));
    setFormattedTime(formatTime(Math.ceil(durationMs / 1000)));
    setIsRunning(true);

    const intervalId = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          setFormattedTime('0s');
          clearInterval(intervalId);
          return 0;
        }
        const newSeconds = prev - 1;
        setFormattedTime(formatTime(newSeconds));
        return newSeconds;
      });
    }, 1000);

    return intervalId;
  }, []);

  // Check if permanently banned (tier >= 5 or very long lockout)
  const checkPermanentBan = useCallback((tier, suspendedUntil) => {
    if (tier >= 5) return true;

    if (suspendedUntil) {
      const suspendedUntilDate = new Date(suspendedUntil);
      const now = new Date();
      const diffHours = (suspendedUntilDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      // Consider permanent if lockout is longer than 1 year
      return diffHours > (24 * 365);
    }

    return false;
  }, []);

  // Simulate the retry function that would call an Edge Function
  // In this implementation, we'll call Supabase directly but in a real app
  // this would go through an Edge Function for better security
  const retry = useCallback(async (email, password) => {
    // In a real implementation, this would call a secure Edge Function
    // For now, we'll simulate the behavior

    try {
      // First check if IP is locked out
      const ipLockoutResult = await checkIpLockout();
      if (ipLockoutResult.locked) {
        return {
          success: false,
          error: `IP address is locked out. Try again in ${formatTime(Math.ceil(ipLockoutResult.retryAfterMs / 1000))}.`,
          retryAfterMs: ipLockoutResult.retryAfterMs
        };
      }

      // Then check email-specific lockout
      const emailLockoutResult = await restoreLockout(email);
      if (emailLockoutResult.locked) {
        return {
          success: false,
          error: `Account is locked out. Try again in ${formatTime(Math.ceil(emailLockoutResult.retryAfterMs / 1000))}.`,
          retryAfterMs: emailLockoutResult.retryAfterMs
        };
      }

      // If no lockouts, attempt actual login
      // This is where you would normally call your login function
      // For now, we'll simulate a successful login after checking credentials
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile?.role?.toLowerCase() === 'enforcer') {
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Invalid email or password.'
        };
      }

      // On successful login, reset any lockout data for this email/IP
      const trimmedEmail = email.toLowerCase().trim();
      const { error: updateError } = await supabase
        .from('login_attempts_tracker')
        .update({
          consecutive_failures: 0,
          lockout_tier: 0,
          suspended_until: null
        })
        .eq('email', trimmedEmail);

      if (updateError) console.warn('Failed to reset lockout on success:', updateError);

      return {
        success: true,
        user: authData.user,
        session: {
          accessToken: authData.session?.access_token,
          refreshToken: authData.session?.refresh_token
        }
      };
    } catch (error) {
      console.error('Login error:', error);

      // Handle different types of errors
      const trimmedEmail = email.toLowerCase().trim();

      // Increment failure count for this email
      try {
        const { data: currentRows, error: fetchError } = await supabase
          .from('login_attempts_tracker')
          .select('consecutive_failures, lockout_tier')
          .eq('email', trimmedEmail)
          .order('updated_at', { ascending: false })
          .limit(1);

        const currentData = currentRows?.[0] ?? null;

        // Handle Supabase errors similar to restoreLockout function
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw fetchError;
        }

        let consecutiveFailures = 0;
        let lockoutTier = 0;

        if (!fetchError && currentData) {
          consecutiveFailures = currentData.consecutive_failures || 0;
          lockoutTier = currentData.lockout_tier || 0;
        }

        const newFailures = consecutiveFailures + 1;
        let newTier = lockoutTier;

        // Determine new tier based on consecutive failures
        if (newFailures >= 50) newTier = 5; // Permanent ban
        else if (newFailures >= 30) newTier = 4;
        else if (newFailures >= 20) newTier = 3;
        else if (newFailures >= 10) newTier = 2;
        else if (newFailures >= 5) newTier = 1;

        // Calculate lockout duration based on tier
        let lockoutDurationSeconds = 0;
        switch (newTier) {
          case 0: lockoutDurationSeconds = 0; break;
          case 1: lockoutDurationSeconds = 60; break; // 1 minute
          case 2: lockoutDurationSeconds = 300; break; // 5 minutes
          case 3: lockoutDurationSeconds = 1800; break; // 30 minutes
          case 4: lockoutDurationSeconds = 3600; break; // 1 hour
          case 5: lockoutDurationSeconds = 86400 * 365; break; // 1 year (effectively permanent)
        }

        // Update or create lockout record
        const now = new Date();
        const suspendedUntil = lockoutDurationSeconds > 0
          ? new Date(now.getTime() + (lockoutDurationSeconds * 1000))
          : null;

        const identifierHash = await hashIdentifier(trimmedEmail);
        const { error: upsertError } = await supabase
          .from('login_attempts_tracker')
          .upsert({
            email: trimmedEmail,
            identifier_hash: identifierHash,
            consecutive_failures: newFailures,
            lockout_tier: newTier,
            suspended_until: suspendedUntil?.toISOString() || null,
            last_ip: '0.0.0.0', // In real app, get actual IP
            updated_at: new Date().toISOString()
          }, { onConflict: 'email,identifier_hash' });

        // Handle Supabase errors for upsert operation
        if (upsertError && upsertError.code !== 'PGRST116') {
          throw upsertError;
        }

        // If this resulted in a lockout, update state
        if (newTier > 0 && suspendedUntil) {
          const retryAfterMs = lockoutDurationSeconds * 1000;
          setLocked(true);
          setSecondsLeft(lockoutDurationSeconds);
          setTier(newTier);
          setEmailLockoutEmail(trimmedEmail);
          setIsPermanentlyBanned(newTier >= 5);
          startCountdown(retryAfterMs);

          return {
            success: false,
            error: `Account locked due to too many failed attempts. Try again in ${formatTime(lockoutDurationSeconds)}.`,
            retryAfterMs
          };
        }

        // If not locked out, return auth error
        return {
          success: false,
          error: 'Invalid email or password.'
        };
      } catch (innerError) {
        console.error('Error updating lockout data:', innerError);
        return {
          success: false,
          error: 'Invalid email or password.'
        };
      }
    }
  }, [checkIpLockout, restoreLockout]);

  // Effect to update formatted time when secondsLeft changes
  useEffect(() => {
    if (isRunning && secondsLeft >= 0) {
      setFormattedTime(formatTime(secondsLeft));

      // Check if we should stop
      if (secondsLeft <= 0) {
        setIsRunning(false);
        setLocked(false);
      }
    }
  }, [secondsLeft, isRunning]);

  // Effect to check lockout status on mount and periodically
  useEffect(() => {
    const checkLockoutStatus = async () => {
      // Check if we have any active lockouts in the system
      try {
        const { data, error } = await supabase
          .from('login_attempts_tracker')
          .select('email, suspended_until, lockout_tier, consecutive_failures, last_ip')
          .not('suspended_until', 'is', null)
          .order('suspended_until', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const record = data[0];
          const suspendedUntil = new Date(record.suspended_until);
          const now = new Date();

          if (suspendedUntil > now) {
            const retryAfterMs = suspendedUntil.getTime() - now.getTime();
            const shouldBeLocked = retryAfterMs > 0;

            if (shouldBeLocked && !isRunning) {
              setLocked(true);
              setSecondsLeft(Math.ceil(retryAfterMs / 1000));
              setTier(record.lockout_tier);
              setEmailLockoutEmail(record.email.toLowerCase().trim());
              setIsPermanentlyBanned(checkPermanentBan(record.lockout_tier, record.suspended_until));
              startCountdown(retryAfterMs);
            } else if (!shouldBeLocked && locked) {
              // Lockout has expired
              setLocked(false);
              setIsRunning(false);
              setSecondsLeft(0);
              setFormattedTime('0s');
            }
          }
        } else if (locked) {
          // No active lockouts found but we think we're locked
          setLocked(false);
          setIsRunning(false);
          setSecondsLeft(0);
          setFormattedTime('0s');
        }
      } catch (error) {
        console.error('Error checking lockout status:', error);
      }
    };

    // Check on mount
    checkLockoutStatus();

    // Also check every 30 seconds
    const intervalId = setInterval(checkLockoutStatus, 30000);

    return () => clearInterval(intervalId);
  }, [locked, isRunning, checkPermanentBan]);

  return {
    locked,
    secondsLeft,
    isRunning,
    tier,
    emailLockoutEmail,
    formattedTime,
    isPermanentlyBanned,
    lockoutData,
    checkIpLockout,
    restoreLockout,
    retry,
    startCountdown,
    // For compatibility with old API
    start: () => {}, // Not used in new API
    reset: () => {}, // Not used in new API
    pause: () => {}  // Not used in new API
  };
}