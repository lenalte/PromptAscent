// src/lib/firebase/index.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

let appInstance: FirebaseApp;
let authInstance: Auth;
let dbInstance: Firestore;

if (typeof window !== 'undefined') { // Running on the client
  if (!getApps().length) { // No Firebase app initialized yet
    if (isFirebaseConfigured()) {
      try {
        // console.log("Firebase config seems complete, attempting to initialize app:", firebaseConfig);
        appInstance = initializeApp(firebaseConfig);
        authInstance = getAuth(appInstance);
        dbInstance = getFirestore(appInstance);
        // console.log("Firebase initialized successfully on the client.");
      } catch (error) {
        console.error("CRITICAL: Firebase client initialization error:", error);
        console.error("Firebase config used (check for undefined values):", firebaseConfig);
        // Throw a more informative error if initialization fails
        const missingKeys = Object.entries(firebaseConfig)
          .filter(([key, value]) => !value && key !== 'measurementId') // measurementId is optional
          .map(([key]) => key)
          .join(', ');
        if (missingKeys) {
          throw new Error(
            `Firebase client initialization failed due to missing configuration for: ${missingKeys}. Please check your .env file for NEXT_PUBLIC_FIREBASE_... variables.`
          );
        }
        throw new Error(`Firebase client initialization failed. This is critical for the app. Check your console and .env file for missing Firebase configuration. Original error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.error(
        'CRITICAL: Firebase configuration is incomplete. Firebase services will not be available. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_... variables are correctly set.'
      );
      // Log which specific essential keys might be missing
      const essentialKeys = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        // Add other keys if they are truly essential for your app's core functionality
      };
      let missingKeysMessage = "Missing or undefined essential Firebase config values: ";
      const foundMissingKeys: string[] = [];
      for (const [key, value] of Object.entries(essentialKeys)) {
        if (!value) foundMissingKeys.push(key);
      }
      if (foundMissingKeys.length > 0) {
        missingKeysMessage += foundMissingKeys.join(', ');
      } else {
        missingKeysMessage += "Unknown essential key (please review firebaseConfig.ts and .env).";
      }
      console.error(missingKeysMessage);

      throw new Error(`Firebase configuration is incomplete. This is critical for the app. Check your .env file for missing NEXT_PUBLIC_FIREBASE_... variables. See browser console for more details: ${missingKeysMessage}`);
    }
  } else { // App already initialized
    appInstance = getApps()[0];
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    // console.log("Firebase app already initialized on the client.");
  }
} else { // Running on the server
  // Provide non-functional placeholders for server-side.
  // Client SDK should not be initialized or used directly on the server.
  // console.log("Firebase client SDK: Not initializing on the server. Placeholders provided.");
  // @ts-ignore
  appInstance = { name: '[SERVER_PLACEHOLDER_APP]', options: {} } as FirebaseApp;
  // @ts-ignore
  authInstance = { name: '[SERVER_PLACEHOLDER_AUTH]' } as Auth;
  // @ts-ignore
  dbInstance = { name: '[SERVER_PLACEHOLDER_DB]' } as Firestore;
}

export { appInstance as app, authInstance as auth, dbInstance as db };
