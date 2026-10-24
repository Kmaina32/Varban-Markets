import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity Verification (KYC) Help",
  description: "Find out why Varban Markets asks for identity verification, which documents you can submit and how to complete the KYC process to access all account features.",
  alternates: {
    canonical: "/help/kyc",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
