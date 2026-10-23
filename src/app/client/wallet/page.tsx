import { Suspense } from "react";
import WalletClient from "./WalletClient";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

/**
 * @fileOverview Capital Hub Server Page.
 * Implements a Suspense boundary with deterministic logo reveal.
 * Wraps WalletClient to handle client-side parameters and chunking gracefully.
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
