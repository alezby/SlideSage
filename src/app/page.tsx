'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Presentation, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { user, signInWithGoogle, loading } = useUser();
  const router = useRouter();
  const [hostname, setHostname] = useState('');
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostname(window.location.hostname);
    }
  }, []);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const userCredential = await signInWithGoogle();
      if (userCredential) {
        router.push('/dashboard');
      } else {
        throw new Error('Sign in failed');
      }
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      toast({
        title: 'Sign-in Failed',
        description: error.message || 'An unexpected error occurred during sign-in.',
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };


  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <div className="bg-primary text-primary-foreground mb-4 rounded-full p-3">
            <Presentation className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline text-3xl font-bold">
            Slide Sage
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your AI-powered presentation assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-sm">
            Connect your Google account to start analyzing your presentations
            for brand consistency, clarity, and impact.
          </p>
          <Button onClick={handleSignIn} className="w-full" size="lg" disabled={loading || isSigningIn}>
            {isSigningIn ? <Loader2 className="animate-spin" /> : 'Connect with Google'}
          </Button>
          {hostname && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>
                Please add the following domain to your Firebase project&apos;s
                authorized domains:
              </p>
              <p className="font-bold text-foreground bg-muted p-2 rounded-md mt-1">
                {hostname}
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            We&apos;ll request access to your Google Slides.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
