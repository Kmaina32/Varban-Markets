import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Desktop Trading Platform",
  description: "Discover the Varban Markets desktop trading platform. See its charting, order tools and multi-market access, and learn how to download and install it.",
  alternates: {
    canonical: "/platforms/desktop",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
