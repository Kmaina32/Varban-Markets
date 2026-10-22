'use client';

import { useEffect } from 'react';
import ErrorNode from '@/components/shared/ErrorNode';

/**
 * @fileOverview Global Root Error Boundary.
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to institutional monitoring node
    console.error('SYSTEM_EXCEPTION:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#F7F7F5]">
      <ErrorNode error={error} reset={reset} context="Root" />
    </div>
  );
}
