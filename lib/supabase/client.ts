import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, used by client components for auth (sign up,
// log in, log out, read the current session). Uses only the public anon key —
// row-level security on the database is what actually protects data.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
