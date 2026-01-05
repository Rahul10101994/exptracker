
'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
} from 'firebase/firestore';

import { useFirestore } from '../provider';
import type { FirebaseError } from 'firebase/app';

export function useCollection<T>(path: string) {
  const firestore = useFirestore();

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirebaseError | null>(null);

  useEffect(() => {
    if (!firestore) {
      return;
    }

    const ref = collection(firestore, path);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data: T[] = [];

        snapshot.forEach((doc) => {
          data.push({
            ...doc.data(),
            id: doc.id,
          } as T);
        });

        setData(data);
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
