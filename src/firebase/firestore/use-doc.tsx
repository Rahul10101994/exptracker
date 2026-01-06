
'use client';

import { useEffect, useState } from 'react';
import {
  doc,
  onSnapshot,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';
import { useFirestore } from '../provider';
import type { FirebaseError } from 'firebase/app';

export function useDoc<T>(path: string) {
  const firestore = useFirestore();

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirebaseError | null>(null);

  useEffect(() => {
    if (!firestore) {
      return;
    }

    const ref = doc(firestore, path);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = {
            ...snapshot.data(),
            id: snapshot.id,
          } as T;

          setData(data);
        } else {
          setData(null);
        }

        setLoading(false);
      },
      (error: FirestoreError) => {
        setError(error);
      }
    );

    return () => unsubscribe();
  }, [firestore, path]);

  return { data, loading, error };
}
