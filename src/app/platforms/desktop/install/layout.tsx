import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install the Desktop Platform",
  description: "Step-by-step instructions to download and install the Varban Markets desktop trading platform, including system requirements and first-time sign-in help.",
  alternates: {
    canonical: "/platforms/desktop/install",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
