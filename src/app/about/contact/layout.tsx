import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Offices and Support",
  description: "Contact Varban Markets by email or visit our offices in Victoria, Seychelles and London, UK. Reach the right team for support and general enquiries.",
  alternates: {
    canonical: "/about/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
