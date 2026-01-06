
'use client';

import { FirebaseProvider, FirebaseContext } from './provider';
import type { FirebaseApp } from 'firebase/app';
import { useMemo } from 'react';
import { UserProvider } from './auth/use-user';

export function FirebaseClientProvider({
  app,
  children,
}: {
  app: FirebaseContext;
  children: React.ReactNode;
}) {

  return (
    <FirebaseProvider
      app={app.app}
      auth={app.auth}
      firestore={app.firestore}
    >
      <UserProvider>
        {children}
      </UserProvider>
    </FirebaseProvider>
  );
}
