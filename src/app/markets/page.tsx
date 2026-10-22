import { Metadata } from 'next';
import MarketsClient from './MarketsClient';

/**
 * @fileOverview Institutional Market Registry Entry.
 * SEO Metadata for the global instrument registry.
 */

export const metadata: Metadata = {
  title: "Global Market Registry | Live Asset Pricing",
  description: "Explore Varban Markets global registry. Real-time pricing for Forex, Crypto, Equities, and Commodities with deep institutional liquidity and millisecond execution.",
  alternates: {
    canonical: '/markets',
  },
};

export default function MarketsPage() {
  return <MarketsClient />;
}
