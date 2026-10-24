import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help: Trading Markets",
  description: "Get answers about the markets available on Varban Markets, including how instruments are quoted, trading hours and how to find and select an asset to trade.",
  alternates: {
    canonical: "/help/markets",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
