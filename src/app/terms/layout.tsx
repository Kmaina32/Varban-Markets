import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read the Varban Markets terms and conditions that govern use of our website and trading services, and find links to our policies on fees, privacy and execution.",
  alternates: {
    canonical: "/terms",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
