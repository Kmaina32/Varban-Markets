'use client';

import { createBrowserClient } from "@supabase/ssr";

/**
 * @fileOverview Hardened Supabase Browser Client.
 * Implements a safety guard to prevent build-time crashes when environment variables are missing.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () => {
  // If variables are missing during build/prerender, use placeholders to prevent @supabase/ssr from throwing
  if (!supabaseUrl || !supabaseKey) {
    return createBrowserClient(
      supabaseUrl || 'https://placeholder-project.supabase.co',
      supabaseKey || 'placeholder-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
