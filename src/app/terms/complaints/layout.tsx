import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complaints Policy",
  description: "Learn how to raise a complaint with Varban Markets, how we investigate it and the timeframes you can expect for acknowledgement and resolution of your case.",
  alternates: {
    canonical: "/terms/complaints",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
