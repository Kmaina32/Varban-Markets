import { MetadataRoute } from 'next'

/**
 * @fileOverview Institutional Sitemap Generator.
 * Automatically maps public platform routes for search engine optimization.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://varbanmarkets.com'
  
  const publicRoutes = [
    '',
    '/markets',
    '/markets/forex',
    '/markets/commodities',
    '/how-it-works',
    '/how-it-works/payments',
    '/technology',
    '/about',
    '/about/licenses',
    '/about/careers',
    '/about/press',
    '/about/contact',
    '/protection',
    '/risk-disclosure',
    '/login',
    '/register',
    '/forgot-password',
    '/accounts/standard',
    '/accounts/professional',
    '/accounts/demo',
  ]

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
