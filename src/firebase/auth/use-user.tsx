'use client';
import { useState, useEffect } from 'react';
import {
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

const SLIDES_SCOPE = 'https://www.googleapis.com/auth/presentations.readonly';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

export function useUser() {
  const { auth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe?.();
  }, [auth]);

  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    if (!auth) return null;

    const provider = new GoogleAuthProvider();
    provider.addScope(SLIDES_SCOPE);
    provider.addScope(DRIVE_SCOPE);
    // Force account selection and consent every time to ensure a fresh token
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        sessionStorage.setItem('google_access_token', credential.accessToken);
      }
      setUser(result.user);
      return result;
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      // Re-throw the error if you want calling components to handle it
      throw error;
    }
  };

  return { user, auth, loading, signInWithGoogle };
}
