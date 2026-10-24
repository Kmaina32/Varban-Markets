import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Varban Markets privacy policy to understand what personal data we collect, why we use it, how it is protected and the rights you have over it.",
  alternates: {
    canonical: "/terms/privacy",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
