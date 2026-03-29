import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Standard client that respects RLS.
 * Used for most database operations.
 */
export async function createClient() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

/**
 * Privileged client that bypasses RLS using the Service Role Key.
 * ONLY use this in Server Actions/Middleware for authorized tasks (like Storage uploads).
 */
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS
    {
      cookies: {
        getAll() { return [] },
        setAll() { },
      },
    }
  );
}
