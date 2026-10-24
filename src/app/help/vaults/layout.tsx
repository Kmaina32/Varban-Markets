import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help: Wallet and Vaults",
  description: "Understand how your Varban Markets wallet and vaults work, including balances, deposits, withdrawals and how to view your transaction history.",
  alternates: {
    canonical: "/help/vaults",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
