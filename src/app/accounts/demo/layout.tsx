import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Demo Trading Account",
  description: "Practise trading on the Varban Markets demo account with virtual funds. Learn the platform and test strategies in simulated markets without real capital.",
  alternates: {
    canonical: "/accounts/demo",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
