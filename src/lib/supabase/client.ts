import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasValidSupabaseUrl = Boolean(
  supabaseUrl &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl) &&
    !supabaseUrl.toLowerCase().includes("project_ref") &&
    !supabaseUrl.toLowerCase().includes("your-project"),
);

export const isSupabaseConfigured = Boolean(hasValidSupabaseUrl && supabaseAnonKey);

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment dəyişənləri təyin edilməyib.");
  }

  if (browserClient) return browserClient;

  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
