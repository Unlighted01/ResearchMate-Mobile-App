// ============================================
// CONFIG - App configuration
// ============================================

export const config = {
  // API endpoints
  apiUrl: process.env.API_URL || "https://your-api-url.netlify.app",

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
};
