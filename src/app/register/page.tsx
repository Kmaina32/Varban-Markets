import { Suspense } from "react";
import RegisterClient from "./RegisterClient";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

/**
 * @fileOverview Onboarding Entry Point.
 * Wraps the RegisterClient in a Suspense boundary as required by Next.js 15
 * when using useSearchParams() during static pre-rendering.
 */

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingOverlay message="Synchronizing Onboarding Node" />}>
      <RegisterClient />
    </Suspense>
  );
}
