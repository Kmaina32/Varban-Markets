import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms: Risk Disclosure",
  description: "Read the risk disclosure terms for Varban Markets. Leveraged and derivative products carry a high risk of loss and may not be suitable for all investors.",
  alternates: {
    canonical: "/terms/risk-disclosure",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
