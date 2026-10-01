'use client';

/**
 * @fileOverview Refined useUser hook.
 * Now consumes Supabase Auth context to provide a unified user state
 * across all existing components during migration.
 */

import { useSupabaseAuth } from '@/app/lib/supabase/auth-context';

export function useUser() {
  const { user, loading } = useSupabaseAuth();
  
  // Map Supabase User to a Firebase-like shape for compatibility with existing UI
  const mappedUser = user ? {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.full_name || user.email?.split('@')[0],
    photoURL: user.user_metadata?.avatar_url,
    ...user
  } : null;

  return { 
    user: mappedUser as any, 
    loading 
  };
}
