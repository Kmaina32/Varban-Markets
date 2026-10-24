import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Standard Trading Account",
  description: "Learn about the Varban Markets Standard account: who it suits, how to open it and what to expect when trading forex, crypto, commodities and synthetic markets.",
  alternates: {
    canonical: "/accounts/standard",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
