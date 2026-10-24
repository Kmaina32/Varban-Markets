import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help: Trading Terminal Guide",
  description: "Learn to use the Varban Markets trading terminal, from reading charts and placing orders to managing open positions and understanding your account balance.",
  alternates: {
    canonical: "/help/terminal",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
