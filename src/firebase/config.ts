
// Follow this guide to set up a new project in the Firebase console:
// https://firebase.google.com/docs/web/setup

// Your web app's Firebase configuration
const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// A mapping from the camelCase keys in firebaseConfigValues to the snake_case keys used in .env
const keyMap: { [key: string]: string } = {
  apiKey: "API_KEY",
  authDomain: "AUTH_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGING_SENDER_ID",
  appId: "APP_ID",
  measurementId: "MEASUREMENT_ID",
};

// Validate that all required environment variables are present
for (const [key, value] of Object.entries(firebaseConfigValues)) {
    if (!value) {
        const envVarName = `NEXT_PUBLIC_${keyMap[key]}`;
        throw new Error(`Firebase config error: Missing environment variable ${envVarName}. Please set it in your Vercel project settings.`);
    }
}

export const firebaseConfig = firebaseConfigValues;
