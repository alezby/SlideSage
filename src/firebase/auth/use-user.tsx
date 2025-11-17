'use client';
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

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

  return { user, auth, loading };
}
