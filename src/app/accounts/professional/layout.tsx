import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Trading Account",
  description: "Compare the Varban Markets Professional account built for experienced traders. See the features, requirements and how to apply to open an account online.",
  alternates: {
    canonical: "/accounts/professional",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
