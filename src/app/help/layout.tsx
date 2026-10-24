import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Centre",
  description: "Browse the Varban Markets Help Centre for guides on opening an account, verification, funding, using the trading terminal and keeping your account secure.",
  alternates: {
    canonical: "/help",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
