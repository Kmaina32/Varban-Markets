import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Information and Company Registration",
  description: "Review the legal and company registration information for Varban Markets Ltd, a company registered in Seychelles with an office in London, United Kingdom.",
  alternates: {
    canonical: "/about/licenses",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
