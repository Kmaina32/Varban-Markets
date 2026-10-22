'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, Firestore, DocumentData } from 'firebase/firestore';

/**
 * @fileOverview Institutional Document Hook.
 * Provides real-time synchronization with a specific Firestore document.
 */

export function useDoc<T = DocumentData>(db: Firestore | null, path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !path) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Doc Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}
