import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logEvent } from '@/debug/logger';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: Promise timeout (prevents infinite spinners from hung requests)
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: number | undefined;
    const timeout = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  // Helper function to fetch user profile (fails fast; never blocks app boot forever)
  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const req = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single<Profile>()
        .then((response) => response);

      const { data, error } = await withTimeout(Promise.resolve(req), 8000, 'fetchUserProfile');

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error);
        return null;
      }

      return (data as Profile) ?? null;
    } catch (error) {
      console.error('[AuthContext] Exception fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const safeSetLoadingFalse = () => {
      if (mounted) setLoading(false);
    };

    const applySession = async (nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      // DEV logging: auth state (no secrets)
      if (import.meta.env.DEV) {
        logEvent('auth_state', { hasSession: !!nextSession, hasUser: !!nextSession?.user });
      }

      // If we have a session, clear loading immediately (auth is done, profile can load in background)
      if (nextSession) {
        safeSetLoadingFalse();
      }

      // Profile fetch should NEVER block the app from rendering
      if (nextSession?.user) {
        const p = await fetchUserProfile(nextSession.user.id);
        if (!mounted) return;
        setProfile(p);
      } else {
        setProfile(null);
      }

      // Ensure loading is cleared if not already done
      safeSetLoadingFalse();
    };

    // 1) Subscribe first (so we don't miss events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      try {
        await applySession(nextSession);
      } catch (e) {
        console.error('[AuthContext] onAuthStateChange handler failed:', e);
        safeSetLoadingFalse();
      }
    });

    // 2) Initial session check
    const checkInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] getSession error:', error);
        }

        await applySession(initialSession);
      } catch (error) {
        console.error('[AuthContext] Error checking initial session:', error);
      } finally {
        safeSetLoadingFalse();
      }
    };

    checkInitialSession();

    // 3) Hard fail-safe: never allow loading to be true forever
    const failSafe = window.setTimeout(() => {
      console.warn('[AuthContext] Loading exceeded 12s; forcing loading=false to prevent infinite spinner.');
      safeSetLoadingFalse();
    }, 12000);

    return () => {
      mounted = false;
      window.clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, session, profile, loading }}>{children}</AuthContext.Provider>;
};
