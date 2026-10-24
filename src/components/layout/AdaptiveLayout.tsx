'use client';

/**
 * @fileOverview Layout for public pages that signed-in users also reach
 * (help articles, market pages, news).
 *
 * - Logged out (and while auth is still resolving, including on the server):
 *   the page content is rendered immediately under the public Navbar/Footer,
 *   so search engines and first paint see real text, never a spinner.
 * - Signed in: the same content is shown inside the workspace shell.
 */

import { useUser } from "@/firebase";
import AuthedLayout from "@/components/layout/AuthedLayout";

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Set when the page renders its own <h1> (hero banners, articles). */
  ownHeading?: boolean;
}

export default function AdaptiveLayout({ children, title, subtitle, ownHeading = false }: AdaptiveLayoutProps) {
  const { user } = useUser();

  if (user) {
    return <AuthedLayout title={title} subtitle={subtitle}>{children}</AuthedLayout>;
  }

  if (ownHeading) {
    return <div className="bg-[#F7F7F5] flex-grow text-[#0A0A0A]">{children}</div>;
  }

  return (
    <div className="bg-[#F7F7F5] flex-grow text-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <header className="border-b border-[#E4E4E4] pb-6 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[#6B7280] mt-3 leading-relaxed max-w-3xl uppercase tracking-tight font-bold">{subtitle}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
