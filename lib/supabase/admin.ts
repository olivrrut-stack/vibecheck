import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client. Bypasses row-level security, so it is the ONLY
// way the server persists reports, marks them paid, and writes fixes. NEVER
// import this from a client component: the `server-only` guard turns that into a
// build error so the service-role key can never reach the browser.
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client is not configured (missing URL or SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
