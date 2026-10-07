import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * @fileOverview Hardened Supabase Server Client.
 * Implements a safety guard to prevent build-time crashes when environment variables are missing.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = async () => {
  const cookieStore = await cookies();

  // If variables are missing during build/prerender, use placeholders to prevent @supabase/ssr from throwing
  if (!supabaseUrl || !supabaseKey) {
    return createServerClient(
      supabaseUrl || 'https://placeholder-project.supabase.co',
      supabaseKey || 'placeholder-anon-key',
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
            // Safe to ignore in Server Components if middleware handles refreshes
          }
        },
      },
    },
  );
};
