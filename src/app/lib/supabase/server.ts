import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * @fileOverview Institutional Supabase Server Client.
 * Hardened for Next.js 15 App Router compatibility.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = async () => {
  const cookieStore = await cookies();

  if (!supabaseUrl || !supabaseKey) {
    // Fallback for build-time safety
    return createServerClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key',
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Standard Next.js 15 Server Component handling
          }
        },
      },
    },
  );
};
