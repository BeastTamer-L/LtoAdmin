// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { mayUseAdminSite } from '../lib/adminAccess';

const AuthContext = createContext({});

// Session rules (2026-10-29):
//  - only a profile that was READ and fails the rules signs the account out; a profile that could not be read
//    (slow network, a token being refreshed) is tried again and never logs anyone out
//  - automatic sign-outs are local (this browser tab's site only): Supabase's default signOut ends the account's
//    sessions everywhere, which looked like random logouts on the other admin site or another device
//  - nothing waits on Supabase inside onAuthStateChange (Supabase warns that can stall the client)
const PROFILE_TRIES = 3;

const readProfile = async (userId) => {
  for (let attempt = 1; attempt <= PROFILE_TRIES; attempt += 1) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!error) return { profile: data, failed: false };
    console.error(`Error loading user profile (try ${attempt}):`, error.message);
    if (attempt < PROFILE_TRIES) await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
  }
  return { profile: null, failed: true };
};

const isRefused = (profile, user) => !mayUseAdminSite(profile, user);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Checks the signed-in account and keeps it, or signs it out of this site
    const applySession = async (session) => {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      const { profile: row, failed } = await readProfile(session.user.id);
      if (!mounted) return;
      if (failed) {
        // keep the session; the pages show what they can and the next reload checks again
        setUser(session.user);
        setLoading(false);
        return;
      }
      if (isRefused(row, session.user)) {
        await supabase.auth.signOut({ scope: 'local' });
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      setProfile(row);
      setUser(session.user);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return; // getSession above handles the first load
      if (event === 'TOKEN_REFRESHED') {
        if (session?.user) setUser(session.user); // same account, new token: no need to check again
        return;
      }
      // run after the callback returns
      setTimeout(() => applySession(session), 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }

    // Update last_login_at in public.profiles
    if (data?.user) {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
