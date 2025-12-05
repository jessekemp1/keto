import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, isFirebaseReady } from '../config/firebase';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code),
    };
  }
};

/**
 * Sign in existing user with email and password
 */
export const signIn = async (email, password) => {
  if (!isFirebaseReady() || !auth) {
    return {
      success: false,
      error: 'Firebase is not configured. Please set up your .env file with Firebase credentials.',
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code),
    };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseReady() || !auth) {
    return {
      success: false,
      error: 'Firebase is not configured. Please set up your .env file with Firebase credentials.',
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: result.user,
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: getErrorMessage(error.code) || 'Google sign-in failed. Please try again.',
    };
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  if (!isFirebaseReady() || !auth) {
    return { success: false, error: 'Firebase is not configured.' };
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'Failed to sign out. Please try again.',
    };
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback) => {
  if (!isFirebaseReady() || !auth) {
    // Return a function that does nothing if Firebase isn't ready
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  if (!isFirebaseReady() || !auth) {
    return null;
  }
  return auth.currentUser;
};

/**
 * Convert Firebase error codes to user-friendly messages
 */
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time. Please try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
};
