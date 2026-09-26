import { Suspense } from "react";
import WalletClient from "./WalletClient";

/**
 * @fileOverview Capital Hub Server Page.
 * Implements a Suspense boundary for useSearchParams() compatibility with Next.js 15 static generation.
 */

export default function WalletPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">
              Loading Capital Hub...
            </span>
          </div>
        </div>
      }
    >
      <WalletClient />
    </Suspense>
  );
}