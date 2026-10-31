import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institutional VPS Hosting",
  description: "Ultra-low latency VPS hosting for professional trading. Ensure 24/7 uptime for your automated strategies with sub-1ms connectivity to Varban execution nodes.",
  alternates: {
    canonical: "/platforms/vps",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
