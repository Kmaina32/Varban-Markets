'use client';

/**
 * @fileOverview Absolute Fallback for Layout Crashes.
 * Must include <html> and <body> per Next.js spec.
 */

import ErrorNode from '@/components/shared/ErrorNode';

export default function GlobalErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F7F7F5] min-h-screen">
        <div className="fixed inset-0 flex items-center justify-center">
          <ErrorNode error={error} reset={reset} context="Infrastructure" />
        </div>
      </body>
    </html>
  );
}
