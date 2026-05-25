import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { env } from "@/lib/env";

/**
 * Supabase client for use in Server Components, Server Actions and Route
 * Handlers. Reads + writes cookies through the Next.js `cookies()` store so
 * the auth session is shared with the browser.
 *
 * Server Components are not allowed to set cookies; we swallow those errors —
 * the middleware will refresh the session on the next request.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component — middleware will refresh.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Called from a Server Component — middleware will refresh.
        }
      },
    },
  });
}
