import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FirebaseProvider } from "@/firebase";
import { I18nProvider } from "@/app/lib/i18n-context";
import { Web3AuthProvider } from "@/app/lib/web3-context";
import CookieConsent from "@/components/layout/CookieConsent";
import ChatSupport from "@/components/ChatSupport";
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Varban Markets | Institutional Electronic Trading Protocol",
    template: "%s | Varban Markets"
  },
  description: "Professional electronic trading protocol for advanced derivatives and synthetic markets. High-speed execution, deterministic settlement, and institutional capital protection.",
  icons: {
    icon: [
      { url: '/pwa.png', type: 'image/png' },
      { url: '/pwa.png', sizes: '32x32', type: 'image/png' },
      { url: '/pwa.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/pwa.png',
    apple: [
      { url: '/pwa.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Varban Markets',
  },
  keywords: ["Forex Trading", "Crypto Derivatives", "Synthetic Markets", "Institutional Trading", "Varban Markets", "High-Speed Execution", "Online Broker"],
  authors: [{ name: "Varban Markets Ltd" }],
  creator: "Varban Markets",
  publisher: "Varban Markets Ltd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://varbanmarkets.com'),
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {siteKey && (
          <Script 
            src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`} 
            strategy="beforeInteractive" 
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F7F5] overflow-x-hidden">
        <FirebaseProvider>
          <I18nProvider>
            <Web3AuthProvider>
              <Navbar />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
              <CookieConsent />
              <ChatSupport />
            </Web3AuthProvider>
          </I18nProvider>
        </FirebaseProvider>
        <Analytics />
      </body>
    </html>
  );
}
