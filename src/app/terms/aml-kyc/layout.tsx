import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AML and KYC Policy",
  description: "Read the Varban Markets anti-money laundering and know-your-customer policy, including how we verify clients and monitor activity to prevent financial crime.",
  alternates: {
    canonical: "/terms/aml-kyc",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
