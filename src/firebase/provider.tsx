
'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';

export type FirebaseContext = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContext>({
  app: null,
  auth: null,
  firestore: null,
});

export function FirebaseProvider(props: {
  children: React.ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  const { app, auth, firestore, children } = props;

  const context = useMemo(
    () => ({
      app,
      auth,
      firestore,
    }),
    [app, auth, firestore]
  );

  return (
    <FirebaseContext.Provider value={context}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

export function useFirebaseApp() {
  return useContext(FirebaseContext).app;
}

export function useAuth() {
  return useContext(FirebaseContext).auth;
}

export function useFirestore() {
  return useContext(FirebaseContext).firestore;
}
