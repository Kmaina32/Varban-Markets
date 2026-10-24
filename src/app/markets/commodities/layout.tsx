import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commodities Markets",
  description: "Browse commodity markets on Varban Markets, including metals and energy. View live prices and learn how commodity derivatives trading works and its risks.",
  alternates: {
    canonical: "/markets/commodities",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
