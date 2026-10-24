import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Execution Policy",
  description: "Read how Varban Markets handles and executes client orders, including order types, price slippage, requotes and the factors that can affect execution.",
  alternates: {
    canonical: "/terms/order-execution",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
