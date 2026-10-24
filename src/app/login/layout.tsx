import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Varban Markets account to trade global markets, manage your wallet and review your positions securely from any device.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/login",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
