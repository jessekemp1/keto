import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// For Expo web, environment variables need to be available at build time
// Using direct values for now - in production, these should come from .env
// Note: Firebase API keys are public client-side keys, not secrets (restricted by domain/auth settings)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyA5rnxP3tsHkWOY0Z3GytJCPVt3gNcCdmQ", // gitleaks:allow
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "ai-keto-tracker.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "ai-keto-tracker",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "ai-keto-tracker.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "347422156966",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:347422156966:web:d46198086cc35c1b5dac67",
};

// Validate Firebase config
const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    !firebaseConfig.apiKey.includes('your-') &&
    !firebaseConfig.projectId.includes('your-')
  );
};

// Initialize Firebase only if configured
let app, auth, db;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.warn('⚠️ Firebase not configured. Cloud sync will be disabled.');
    console.warn('💡 Create a .env file with your Firebase config. See .env.example');
  }
} else {
  console.warn('⚠️ Firebase not configured. Cloud sync will be disabled.');
  console.warn('💡 Create a .env file with your Firebase config. See .env.example');
  // Create dummy objects to prevent errors
  app = null;
  auth = null;
  db = null;
}

export { auth, db };
export const isFirebaseReady = () => isFirebaseConfigured() && app !== null;
export default app;
