'use client';

/**
 * @fileOverview Inert Collection Hook (Stub).
 * Decommissioned to prevent Firestore assertion crashes.
 */

import { useEffect, useState } from 'react';

export function useCollection<T>(q: any) {
  const [data, setData] = useState<T[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Firestore listeners disabled to prevent crashes
  return { data: data || [], loading, error };
}
