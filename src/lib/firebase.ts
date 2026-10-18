import { GoogleAuthProvider, User, getAuth, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-placeholder',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-placeholder.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project-id.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '0000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

export const firebaseReady = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
);

const app = firebaseReady ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const provider = app ? new GoogleAuthProvider() : null;

export async function handleGoogleSignIn() {
  if (!auth || !provider) {
    return {
      user: {
        uid: 'demo-user-1',
        displayName: 'Demo Builder',
        email: 'demo@housemakeplay.app',
      },
    };
  }

  const result = await signInWithPopup(auth, provider);
  return { user: result.user };
}

export type FirebaseUser = User;
