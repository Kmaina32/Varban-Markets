import { Metadata } from 'next';
import MarketsClient from './MarketsClient';

/**
 * @fileOverview Institutional Market Registry Entry.
 * SEO Metadata for the global instrument registry.
 */

export const metadata: Metadata = {
  title: "Global Market Registry | Live Asset Pricing",
  description: "Explore Varban Markets global registry. Browse live pricing across forex, crypto, equities and commodities, and open any market to view its chart and trade.",
  alternates: {
    canonical: '/markets',
  },
};

export default function MarketsPage() {
  return <MarketsClient />;
}
