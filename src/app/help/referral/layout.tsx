import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help: Referral Programme",
  description: "Learn how the Varban Markets referral programme works, how to share your referral link and where to track the people you have invited to the platform.",
  alternates: {
    canonical: "/help/referral",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
