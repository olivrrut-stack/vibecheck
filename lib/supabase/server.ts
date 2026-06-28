import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client bound to the request's cookies, so Server
// Components, Route Handlers, and Server Actions can read the logged-in user and
// keep the session fresh. Next 15+/16 makes cookies() async, hence the await.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a pure Server Component the cookie store is read-only and this
          // throws; that's expected, the session refresh happens in middleware.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // no-op: called from a context where cookies can't be set
          }
        },
      },
    }
  );
}
