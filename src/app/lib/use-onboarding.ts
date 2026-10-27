"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser, useDoc, useFirestore } from "@/firebase";
import { getOnboardingState, OnboardingState } from "./onboarding";

const SUPER_ADMIN_EMAILS = ["macos8388@gmail.com", "gmaina4242@gmail.com"];

export interface OnboardingInfo {
  /** False until the account record has really loaded, so nothing flashes. */
  ready: boolean;
  state: OnboardingState;
  isAdmin: boolean;
  /** Admins are never blocked; everyone else needs all three steps. */
  canTrade: boolean;
}

export function useOnboarding(): OnboardingInfo {
  const { user } = useUser();
  const db = useFirestore();
  const { data: profile, loading, error } = useDoc<any>(db, user ? `users/${user.uid}` : null);

  // useDoc reports loading=false for one render before it starts fetching.
  const [seenLoadingUid, setSeenLoadingUid] = useState<string | null>(null);
  useEffect(() => {
    if (user?.uid && loading) setSeenLoadingUid(user.uid);
  }, [user?.uid, loading]);

  return useMemo(() => {
    const state = getOnboardingState(profile);
    const email = user?.email?.toLowerCase();
    const isAdmin = !!email && (SUPER_ADMIN_EMAILS.includes(email) || profile?.status?.role === "Admin");
    const ready = !!user && !loading && (!db || seenLoadingUid === user.uid);
    return {
      ready,
      state,
      isAdmin,
      // If the record can't be read we stay locked rather than guess.
      canTrade: isAdmin || (ready && !error && state.complete),
    };
  }, [profile, user, loading, error, db, seenLoadingUid]);
}
