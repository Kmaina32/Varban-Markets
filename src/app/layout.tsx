import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FirebaseProvider } from "@/firebase";
import { I18nProvider } from "@/app/lib/i18n-context";
import { SupabaseAuthProvider } from "@/app/lib/supabase/auth-context";
import CookieConsent from "@/components/layout/CookieConsent";
import ChatSupport from "@/components/ChatSupport";
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: "Varban Markets | Institutional Electronic Trading Protocol",
    template: "%s | Varban Markets"
  },
  description: "Professional electronic trading protocol for advanced derivatives and synthetic markets. High-speed execution, deterministic settlement, and institutional capital protection.",
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
  openGraph: {
    title: "Varban Markets | Institutional Electronic Trading Protocol",
    description: "Access global derivatives and synthetic markets with millisecond-accurate execution and institutional-grade security.",
    url: 'https://varbanmarkets.com',
    siteName: 'Varban Markets',
    images: [
      {
        url: '/assets/hero.png',
        width: 1200,
        height: 630,
        alt: 'Varban Markets Trading Terminal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Varban Markets | Institutional Trading',
    description: 'High-speed derivative execution and synthetic market infrastructure.',
    images: ['/assets/hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <SupabaseAuthProvider>
          <FirebaseProvider>
            <I18nProvider>
              <Navbar />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
              <CookieConsent />
              <ChatSupport />
            </I18nProvider>
          </FirebaseProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
