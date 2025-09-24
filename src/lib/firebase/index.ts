import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured()) {
  // Initialize Firebase app only if it hasn't been initialized yet
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  console.error(
    'CRITICAL: Firebase configuration is incomplete. Firebase services will not be available. Please check your .env file and ensure all NEXT_PUBLIC_FIREBASE_... variables are correctly set.'
  );
}

// These exports may be undefined if the config is not provided.
// The app using them should handle this gracefully.
// @ts-ignore
export { app, auth, db };
