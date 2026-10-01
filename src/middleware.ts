import { type NextRequest } from 'next/server';
import { updateSession } from '@/app/lib/supabase/middleware';

/**
 * @fileOverview Application Middleware.
 * Updated to handle Supabase session refreshing for secure App Router navigation.
 */

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
