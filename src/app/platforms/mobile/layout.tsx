import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile Trading App",
  description: "Trade on the go with the Varban Markets mobile app. Monitor markets, manage positions and fund your account from your phone or tablet, wherever you are.",
  alternates: {
    canonical: "/platforms/mobile",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
