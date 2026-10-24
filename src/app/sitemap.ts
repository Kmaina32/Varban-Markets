import { MetadataRoute } from 'next'

/**
 * @fileOverview Sitemap generator. Lists indexable public routes only.
 * LAST_UPDATED is a fixed date: bump it only when public content changes.
 */

const baseUrl = 'https://varbanmarkets.com'
const LAST_UPDATED = '2026-10-24'

const routes: Array<[string, number]> = [
  ['', 1],
  ['/markets', 0.9],
  ['/markets/forex', 0.8],
  ['/markets/commodities', 0.8],
  ['/accounts/standard', 0.8],
  ['/accounts/professional', 0.8],
  ['/accounts/demo', 0.8],
  ['/platforms/desktop', 0.7],
  ['/platforms/desktop/install', 0.5],
  ['/platforms/mobile', 0.7],
  ['/how-it-works', 0.8],
  ['/how-it-works/payments', 0.7],
  ['/technology', 0.7],
  ['/protection', 0.7],
  ['/about', 0.7],
  ['/about/contact', 0.6],
  ['/about/licenses', 0.5],
  ['/about/careers', 0.5],
  ['/about/press', 0.4],
  ['/contact', 0.6],
  ['/news', 0.6],
  ['/help', 0.6],
  ['/help/kyc', 0.5],
  ['/help/markets', 0.5],
  ['/help/referral', 0.4],
  ['/help/security', 0.5],
  ['/help/terminal', 0.5],
  ['/help/vaults', 0.5],
  ['/risk-disclosure', 0.6],
  ['/terms', 0.4],
  ['/terms/aml-kyc', 0.3],
  ['/terms/complaints', 0.3],
  ['/terms/fees', 0.4],
  ['/terms/market-data', 0.3],
  ['/terms/order-execution', 0.3],
  ['/terms/privacy', 0.4],
  ['/terms/risk-disclosure', 0.4],
  ['/terms/trading-rules', 0.3],
  ['/register', 0.7],
  ['/login', 0.3],
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(([route, priority]) => ({
    url: `${baseUrl}${route}`,
    lastModified: LAST_UPDATED,
    priority,
  }))
}
