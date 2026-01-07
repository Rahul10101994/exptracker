
"use client";

import { useState, useEffect } from "react";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { useFirebaseApp, useUser, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";
import { toast } from "./use-toast";

export function useFcmToken() {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const userContext = useUser();
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const retrieveToken = async () => {
    const isMessagingSupported = await isSupported();
    if (!isMessagingSupported || !app || !firestore || !userContext?.user) {
      console.log(
        "Firebase Messaging is not supported in this browser or user not logged in."
      );
      return;
    }
    
    try {
      const messaging = getMessaging(app);
      
      // Register the service worker
      const serviceWorkerRegistration = await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?firebaseConfig=${encodeURIComponent(JSON.stringify(firebaseConfig))}`
      );
      
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
        serviceWorkerRegistration
      });

      if (currentToken) {
        console.log("FCM token retrieved:", currentToken);
        // Save the token to Firestore
        const userDocRef = doc(firestore, "users", userContext.user.uid);
        await setDoc(userDocRef, { fcmToken: currentToken }, { merge: true });
        toast({ title: "Notifications Enabled", description: "You will now receive push notifications."});
      } else {
        console.log("No registration token available. Request permission to generate one.");
        toast({ variant: "destructive", title: "Could not get token", description: "Permission might be required." });
      }
    } catch (err) {
      console.error("An error occurred while retrieving token. ", err);
      toast({ variant: "destructive", title: "Error enabling notifications", description: "Please try again." });
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
        toast({ variant: "destructive", title: "Push notifications not supported", description: "Your browser does not support push notifications."});
        return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === "granted") {
      await retrieveToken();
    } else {
        toast({ variant: "destructive", title: "Permission Denied", description: "You have blocked push notifications."});
    }
  };

  return { notificationPermission, requestNotificationPermission };
}
