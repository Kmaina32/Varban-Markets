import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market News and Analysis",
  description: "Read the latest market news and analysis from Varban Markets covering forex, crypto, commodities and the economic events that move global financial markets.",
  alternates: {
    canonical: "/news",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
