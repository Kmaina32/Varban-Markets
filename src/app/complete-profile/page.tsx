"use client";

/**
 * @fileOverview Complete Profile gate page.
 * Every signed-in user must finish their profile (name, 18+ date of birth,
 * phone, country, address, investor questions) before using the workspace.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useUser, useFirestore, initializeFirebase } from "@/firebase";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import ProfileTab from "@/components/account/ProfileTab";
import { getProfileGaps } from "@/app/lib/profile-completion";

const DEFAULT_NEXT = "/client/dashboard";

function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/client") || raw.startsWith("//") || raw.includes("\\")) return DEFAULT_NEXT;
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin || !u.pathname.startsWith("/client")) return DEFAULT_NEXT;
    return u.pathname + u.search + u.hash;
  } catch {
    return DEFAULT_NEXT;
  }
}

function CompleteProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useUser();
  const db = useFirestore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router]);

  // If the profile is already complete, don't show the form; continue on.
  useEffect(() => {
    if (!user?.uid || !db) return;
    let cancelled = false;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (cancelled) return;
        if (snap.exists() && getProfileGaps(snap.data()).length === 0) {
          router.replace(safeNext(searchParams.get("next")));
        } else {
          setChecked(true);
        }
      })
      .catch(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, [user?.uid, db, router, searchParams]);

  const signOut = async () => {
    try {
      await initializeFirebase().auth.signOut();
    } finally {
      router.replace("/");
    }
  };

  if (loading || !user || !checked) return <LoadingOverlay message="Establishing Secure Routing" />;

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-sm font-bold uppercase tracking-[0.15em]">Complete your profile</h1>
            <p className="text-[10px] text-[#6B7280] uppercase font-bold leading-relaxed max-w-xl">
              As a regulated trading platform we must verify who you are before you can use your account.
              Please provide your details below; you must be 18 or older. This takes about two minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#0055FF] underline decoration-2 underline-offset-4"
          >
            Sign out
          </button>
        </div>
        <ProfileTab
          showGateBanner
          onCompleted={() => router.replace(safeNext(searchParams.get("next")))}
        />
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<LoadingOverlay message="Establishing Secure Routing" />}>
      <CompleteProfileInner />
    </Suspense>
  );
}
