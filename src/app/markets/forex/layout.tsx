import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forex Markets and Currency Pairs",
  description: "Explore forex currency pairs available on Varban Markets. View live pricing, understand how leveraged trading works and learn about the risks involved.",
  alternates: {
    canonical: "/markets/forex",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
