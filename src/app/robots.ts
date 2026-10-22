import { MetadataRoute } from 'next'

/**
 * @fileOverview Search Engine Indexing Protocol.
 * Controls crawler access to maintain platform security and SEO focus.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/client/', 
        '/api/',
        '/_next/',
        '/static/'
      ],
    },
    sitemap: 'https://varbanmarkets.com/sitemap.xml',
  }
}
