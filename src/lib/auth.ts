import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAPMa35mCZBIAPjITa8h12kbllxwAgIDPU",
  authDomain: "money-88d37.firebaseapp.com",
  projectId: "money-88d37",
  storageBucket: "money-88d37.firebasestorage.app",
  messagingSenderId: "222269525597",
  appId: "1:222269525597:web:bf92ece249dcce48acc7b4",
  measurementId: "G-FHXP58VLPQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only on client
if (typeof window !== "undefined") {
  getAnalytics(app);
}

const provider = new GoogleAuthProvider();

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user') {
      console.error('Sign in error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
