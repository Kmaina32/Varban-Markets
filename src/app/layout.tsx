import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FirebaseProvider } from "@/firebase";
import { I18nProvider } from "@/app/lib/i18n-context";
import CookieConsent from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  title: "Varban Markets | Institutional Electronic Trading Protocol",
  description: "Institutional electronic trading protocol for advanced derivatives and synthetic markets built on deterministic software infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F7F7F5] overflow-x-hidden">
        <FirebaseProvider>
          <I18nProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
            <CookieConsent />
          </I18nProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
