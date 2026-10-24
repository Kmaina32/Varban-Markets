import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help: Account Security",
  description: "Practical tips to secure your Varban Markets account, including strong passwords, recognising phishing attempts and what to do if you suspect unauthorised use.",
  alternates: {
    canonical: "/help/security",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
