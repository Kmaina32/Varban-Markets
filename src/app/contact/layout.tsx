import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Varban Markets Support",
  description: "Get in touch with the Varban Markets support team for help with your account, funding, platform access or general enquiries. We reply by email.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
