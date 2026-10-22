'use client';

import { useEffect } from 'react';
import ErrorNode from '@/components/shared/ErrorNode';

/**
 * @fileOverview Trading Workspace Error Boundary.
 */

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('WORKSPACE_EXCEPTION:', error);
  }, [error]);

  return <ErrorNode error={error} reset={reset} context="Workspace" />;
}
