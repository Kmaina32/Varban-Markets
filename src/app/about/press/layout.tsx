import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press and Media Resources",
  description: "Find press and media resources for Varban Markets, including company background, brand assets and contact details for journalists and media enquiries.",
  alternates: {
    canonical: "/about/press",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
