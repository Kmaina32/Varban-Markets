'use client';

import { useEffect } from 'react';
import ErrorNode from '@/components/shared/ErrorNode';

/**
 * @fileOverview Administration Node Error Boundary.
 */

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('ADMIN_EXCEPTION:', error);
  }, [error]);

  return <ErrorNode error={error} reset={reset} context="Oversight" />;
}
