import { Suspense } from "react";
import RegisterClient from "./RegisterClient";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import type { Metadata } from "next";

/**
 * @fileOverview Onboarding Entry Point.
 * Wraps the RegisterClient in a Suspense boundary as required by Next.js 15
 * when using useSearchParams() during static pre-rendering.
 */

export const metadata: Metadata = {
  title: "Create Account | Join Varban Markets",
  description: "Open a professional trading account with Varban Markets. Access global derivatives and synthetic markets with deterministic execution and deep liquidity.",
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingOverlay message="Synchronizing Onboarding Node" />}>
      <RegisterClient />
    </Suspense>
  );
}
