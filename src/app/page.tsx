import type { Metadata } from "next";
import LandingClient from "./LandingClient";

/**
 * @fileOverview Landing page entry. Kept as a thin server component so the
 * page can declare its own canonical URL; the interactive page lives in
 * LandingClient.tsx. Title and description come from the root layout.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <LandingClient />;
}
