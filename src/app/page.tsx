'use client';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { Presentation, Loader2, Star, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function Home() {
  const { user, signInWithGoogle, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [hostname, setHostname] = useState('');
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
      await signInWithGoogle();
      // The useEffect will handle the redirect
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Presentation className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tighter">
              Slide Sage
            </h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
            Elevate Your Presentations with AI.
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Transform your Google Slides with intelligent analysis. Get feedback on brand consistency, clarity, and impact to deliver presentations that resonate.
          </p>
          <div className="flex flex-col gap-4">
            <Button onClick={handleSignIn} size="lg" disabled={isSigningIn} className="font-semibold">
              {isSigningIn ? <Loader2 className="animate-spin" /> : 'Connect with Google'}
            </Button>
            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Analyze for brand consistency & clarity</span>
                </div>
                 <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Get actionable, slide-by-slide comments</span>
                </div>
                 <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Refine suggestions with a conversational AI</span>
                </div>
            </div>
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
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center p-8 bg-muted rounded-l-xl">
           <Image
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhaSUyMGFuYWx5c2lzJTIwcHJlc2VudGF0aW9ufGVufDB8fHx8MTc2MzMyNzE4OXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="AI analyzing a presentation"
                width={500}
                height={500}
                className="rounded-lg shadow-2xl"
                data-ai-hint="ai analysis"
              />
        </div>
      </div>
    </main>
  );
}
