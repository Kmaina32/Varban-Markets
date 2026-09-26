
'use client';

/**
 * @fileOverview Redirect gateway for consolidated account hub.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account?tab=alerts');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
