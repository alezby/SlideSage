import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Presentation } from 'lucide-react';

export default function Home() {
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
            Connect your Google account to start analyzing your presentations for
            brand consistency, clarity, and impact.
          </p>
          <Button asChild className="w-full" size="lg">
            <Link href="/dashboard">Connect with Google</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            We&apos;ll request access to your Google Slides.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
