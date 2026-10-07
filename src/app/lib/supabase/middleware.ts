import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @fileOverview Next.js 15 Middleware for Supabase Session Refreshing.
 * Standardized cookie-sync pattern to ensure both request and response context.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Guard against missing Supabase credentials during build/deployment
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Set on the request for current session visibility
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          
          // 2. Refresh response object
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // 3. Set on the response to persist to browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Refresh user session state (required to persist auth state)
  await supabase.auth.getUser();

  return supabaseResponse;
};
