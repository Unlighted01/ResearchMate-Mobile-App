// ============================================
// SUPABASE CLIENT - Mobile Version
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import {
  createClient,
  SupabaseClient,
  User,
  Session,
  AuthChangeEvent,
} from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

// ============================================
// PART 2: CONFIGURATION
// ============================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase environment variables");
}

// ============================================
// PART 3: SECURE STORAGE ADAPTER
// ============================================

// Custom storage adapter using Expo SecureStore for auth tokens
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
    }
  },
};

// ============================================
// PART 4: CLIENT INITIALIZATION
// ============================================

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Mobile doesn't use URL detection
    },
  }
);

// ============================================
// PART 5: TYPE DEFINITIONS
// ============================================

export interface AuthResult {
  user: User | null;
  error: Error | null;
}

export interface SessionResult {
  session: Session | null;
  error: Error | null;
}

export type AuthEventCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

// ============================================
// PART 6: USER AUTHENTICATION FUNCTIONS
// ============================================

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("❌ Get user error:", error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error("❌ Get user exception:", error);
    return null;
  }
}

export async function getSession(): Promise<SessionResult> {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      return { session: null, error };
    }
    return { session, error: null };
  } catch (error) {
    return { session: null, error: error as Error };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

// ============================================
// PART 7: EMAIL AUTHENTICATION
// ============================================

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    console.log("🔑 Sign in attempt");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error("❌ Sign in error:", error.message);
      return { user: null, error };
    }

    console.log("✅ Signed in successfully");
    return { user: data.user, error: null };
  } catch (error) {
    console.error("❌ Sign in exception:", error);
    return { user: null, error: error as Error };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    console.log("📝 Sign up attempt");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error("❌ Sign up error:", error.message);
      return { user: null, error };
    }

    console.log("✅ Sign up successful");
    return { user: data.user, error: null };
  } catch (error) {
    console.error("❌ Sign up exception:", error);
    return { user: null, error: error as Error };
  }
}

// ============================================
// PART 8: GOOGLE OAUTH
// ============================================

import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";

// Enable web browser redirect handling
WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google OAuth
 * Uses Supabase OAuth with deep linking
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    console.log("🔑 Starting Google OAuth");

    // Create redirect URI for Expo
    const redirectTo = makeRedirectUri({
      scheme: "researchmate",
      path: "auth/callback",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error("❌ Google OAuth error:", error.message);
      return { error };
    }

    if (data?.url) {
      // Open the OAuth URL in a web browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === "success") {
        // Extract the URL and get session
        const url = result.url;
        // Parse the tokens from the URL
        const params = new URL(url).hash.substring(1);
        const urlParams = new URLSearchParams(params);
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          console.log("✅ Google sign in successful");
          return { error: null };
        }
      }
    }

    return { error: new Error("OAuth cancelled or failed") };
  } catch (error) {
    console.error("❌ Google OAuth exception:", error);
    return { error: error as Error };
  }
}

// ============================================
// PART 9: SIGN OUT
// ============================================

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    console.log("🚪 Signing out");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ Sign out error:", error.message);
      return { error };
    }

    console.log("✅ Signed out successfully");
    return { error: null };
  } catch (error) {
    console.error("❌ Sign out exception:", error);
    return { error: error as Error };
  }
}

// ============================================
// PART 9: AUTH STATE LISTENER
// ============================================

export function onAuthStateChange(callback: AuthEventCallback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("🔄 Auth state changed:", event);
    callback(event, session);
  });

  return subscription;
}

// ============================================
// PART 10: PASSWORD RESET
// ============================================

export async function resetPassword(
  email: string
): Promise<{ error: Error | null }> {
  try {
    console.log("📧 Sending password reset email");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      console.error("❌ Password reset error:", error.message);
      return { error };
    }

    console.log("✅ Password reset email sent");
    return { error: null };
  } catch (error) {
    console.error("❌ Password reset exception:", error);
    return { error: error as Error };
  }
}

// ============================================
// PART 11: EXPORTS
// ============================================

export default {
  supabase,
  getCurrentUser,
  getSession,
  isAuthenticated,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  onAuthStateChange,
  resetPassword,
};
