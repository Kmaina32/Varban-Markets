'use client';

/**
 * @fileOverview Inert Document Hook (Stub).
 * Decommissioned to prevent Firestore assertion crashes.
 */

import { useEffect, useState } from 'react';

export function useDoc<T>(db: any, path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Firestore listeners disabled to prevent crashes
  return { data, loading, error };
}
