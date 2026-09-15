
'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, DocumentReference, Firestore } from 'firebase/firestore';

export function useDoc<T>(db: Firestore | null, path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !path) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, path);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? (snapshot.data() as T) : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [db, path]);

  return { data, loading, error };
}
