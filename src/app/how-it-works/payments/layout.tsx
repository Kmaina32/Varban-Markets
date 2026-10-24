import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deposits and Withdrawals Guide",
  description: "Understand how funding and withdrawals work on Varban Markets, including supported payment methods, processing steps and verification requirements.",
  alternates: {
    canonical: "/how-it-works/payments",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
