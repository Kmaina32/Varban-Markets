"use client";

/**
 * @fileOverview Complete Profile Page.
 * Now acts as a gateway to Account Settings with institutional reveal.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        // Redirect to Account page to consolidate profile management
        router.push('/account');
      }
    }
  }, [user, loading, router]);

  return <LoadingOverlay message="Establishing Secure Routing" />;
}