
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, Messaging } from 'firebase/messaging';
import { firebaseConfig } from './config';

import { FirebaseClientProvider } from './client-provider';
import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useMessaging,
} from './provider';

import { useDoc } from './firestore/use-doc';
import { useCollection } from './firestore/use-collection';
import { useUser } from './auth/use-user';

function initializeFirebase() {
  const apps = getApps();

  let app: FirebaseApp;
  let auth: Auth;
  let firestore: Firestore;
  let messaging: Messaging | null = null;

  if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  auth = getAuth(app);
  firestore = getFirestore(app);

  if (typeof window !== 'undefined') {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.error("Firebase Messaging not supported in this browser:", e);
    }
  }

  return { app, auth, firestore, messaging };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useMessaging,
};
