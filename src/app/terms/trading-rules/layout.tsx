import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading Rules",
  description: "Review the Varban Markets trading rules covering permitted trading conduct, margin and leverage, position limits and actions we may take on your account.",
  alternates: {
    canonical: "/terms/trading-rules",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
