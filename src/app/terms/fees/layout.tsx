import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fees and Charges",
  description: "Review the fees and charges that may apply to your Varban Markets account, including trading costs, funding and withdrawal charges and other account fees.",
  alternates: {
    canonical: "/terms/fees",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
