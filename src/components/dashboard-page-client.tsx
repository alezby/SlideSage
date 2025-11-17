'use client';
import { DashboardProvider, useDashboard } from '@/contexts/dashboard-context';
import type { Presentation } from '@/lib/data';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import SlideViewer from './slide-viewer';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardHeader from './dashboard-header';

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
      </main>
    </div>
  );
}

function DashboardContent() {
    const { selectedPresentation } = useDashboard();

    if (!selectedPresentation) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        No presentation selected
                    </h3>
                    <p className="text-muted-foreground">
                        Connect to Google Drive and choose a presentation to begin.
                    </p>
                </div>
            </div>
        );
    }

    return <SlideViewer />;
}


export default function DashboardPageClient({
  presentations: initialPresentations,
}: {
  presentations: Presentation[];
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <DashboardProvider presentations={initialPresentations}>
        <DashboardLayout>
            <DashboardContent />
        </DashboardLayout>
    </DashboardProvider>
  );
}
