import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Protection and Account Security",
  description: "Learn how Varban Markets approaches account security, client fund handling and platform safeguards, and what you can do to help keep your account safe.",
  alternates: {
    canonical: "/protection",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
