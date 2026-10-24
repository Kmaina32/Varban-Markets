import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Data Policy",
  description: "Read the Varban Markets market data policy, which explains the sources of our price feeds, how quotes are shown and the limits on how data may be used.",
  alternates: {
    canonical: "/terms/market-data",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
