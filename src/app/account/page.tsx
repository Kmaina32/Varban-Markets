import { Suspense } from "react";
import AccountClient from "./AccountClient";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

/**
 * @fileOverview Account Hub Server Page.
 * Implements a Suspense boundary with deterministic logo reveal.
 */

export default function AccountPage() {
  return (
    <Suspense 
      fallback={
        <LoadingOverlay message="Synchronizing Security Vault" />
      }
    >
      <AccountClient />
    </Suspense>
  );
}