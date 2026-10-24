import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers at Varban Markets",
  description: "Explore career opportunities at Varban Markets. Learn about our culture, the teams building our trading platform and how to apply for open roles.",
  alternates: {
    canonical: "/about/careers",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
