import { MetadataRoute } from 'next'

/**
 * @fileOverview Progressive Web App Manifest Configuration.
 * Defines the application identity, theme, and icons for mobile installation.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Varban Markets Terminal',
    short_name: 'Varban',
    description: 'Institutional electronic trading protocol for advanced derivatives.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#0A0A0A',
    icons: [
      {
        src: '/pwa.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
