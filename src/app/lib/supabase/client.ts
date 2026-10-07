'use client';

import { createBrowserClient } from "@supabase/ssr";

/**
 * @fileOverview Institutional Supabase Browser Client.
 * Implements a safety guard for build-time static generation.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // Fallback for build-time safety
    return createBrowserClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
