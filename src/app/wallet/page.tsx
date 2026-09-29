import { Suspense } from "react";
import WalletClient from "./WalletClient";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

/**
 * @fileOverview Capital Hub Server Page.
 * Implements a Suspense boundary with deterministic logo reveal.
 */

export default function WalletPage() {
  return (
    <Suspense 
      fallback={
        <LoadingOverlay message="Accessing Institutional Ledger" />
      }
    >
      <WalletClient />
    </Suspense>
  );
}