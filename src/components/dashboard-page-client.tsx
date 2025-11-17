'use client';
import { DashboardProvider, useDashboard } from '@/contexts/dashboard-context';
import type { Presentation } from '@/lib/data';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Presentation as PresentationIcon, Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
  SidebarContent,
} from '@/components/ui/sidebar';
import PresentationSelector from './presentation-selector';
import SlideViewer from './slide-viewer';
import AnalysisPanel from './analysis-panel';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function DashboardLayout({ children }: { children: ReactNode }) {
  const { selectedPresentation } = useDashboard();
  const { user, auth } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      sessionStorage.removeItem('google_access_token');
      router.push('/');
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <PresentationIcon className="h-6 w-6 text-primary" />
                </Link>
              </Button>
              <h1 className="font-headline text-xl font-semibold">Slide Sage</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <PresentationSelector />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
            <SidebarTrigger className="md:hidden absolute left-4 top-3" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={user?.photoURL || "https://picsum.photos/seed/user/32/32"}
                      alt={user?.displayName || 'user'}
                    />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 sm:px-6">
            {selectedPresentation ? (
              children
            ) : (
              <div className="flex pt-24 justify-center rounded-lg text-center">
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-2xl font-semibold">Welcome to Slide Sage</h2>
                  <p className="text-muted-foreground">
                    Connect your Google Drive to get started.
                  </p>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function DashboardPageClient({
  presentations,
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
    <DashboardProvider presentations={presentations}>
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          <div className="lg:col-span-3 xl:col-span-4">
            <SlideViewer />
          </div>
          <div className="lg:col-span-2 xl:col-span-1">
            <AnalysisPanel />
          </div>
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
}
