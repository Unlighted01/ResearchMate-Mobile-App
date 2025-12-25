// ============================================
// AUTH CONTEXT - Authentication State Provider
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import {
  supabase,
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  onAuthStateChange,
  resetPassword,
} from "../services/supabaseClient";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: Error | null }>;
}

// ============================================
// PART 3: CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PART 4: AUTH PROVIDER COMPONENT
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ---------- PART 4A: STATE ----------
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------- PART 4B: EFFECTS ----------
  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const subscription = onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------- PART 4C: AUTH METHODS ----------
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await signInWithEmail(email, password);
    setLoading(false);
    return { error: result.error };
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const result = await signUpWithEmail(email, password);
    setLoading(false);
    return { error: result.error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const forgotPassword = async (email: string) => {
    return await resetPassword(email);
  };

  // ---------- PART 4D: CONTEXT VALUE ----------
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// PART 5: CUSTOM HOOK
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================
// PART 6: EXPORTS
// ============================================

export default AuthContext;
