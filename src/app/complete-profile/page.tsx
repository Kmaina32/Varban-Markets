"use client";

/**
 * @fileOverview Complete Profile Page.
 * Now acts as a gateway to Account Settings for detailed profile modification.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
          Redirecting to Security Vault...
        </p>
      </div>
    </div>
  );
}
