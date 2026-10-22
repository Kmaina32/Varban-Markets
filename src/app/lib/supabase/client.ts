'use client';

import { createBrowserClient } from "@supabase/ssr";

/**
 * @fileOverview Institutional Supabase Browser Client.
 * Implements a safety guard for build-time static generation.
 * Updated to use standard Anon Key variable naming.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
