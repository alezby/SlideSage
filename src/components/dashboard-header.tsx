
'use client';

import Link from 'next/link';
import {
  Presentation as PresentationIcon,
  Settings,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import PresentationSelector from './presentation-selector';
import { useDashboard } from '@/contexts/dashboard-context';

export default function DashboardHeader() {
  const { user, auth } = useUser();
  const router = useRouter();
  const { presentations } = useDashboard();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      sessionStorage.removeItem('google_access_token');
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex items-center gap-2">
         <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <PresentationIcon className="h-6 w-6 text-primary" />
            <span className="">Slide Sage</span>
          </Link>
      </div>
     
      <div className="flex-1">
        <nav className="flex items-center justify-center">
            {presentations.length > 0 && <PresentationSelector />}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {presentations.length === 0 && <PresentationSelector />}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage
                  src={user?.photoURL || 'https://picsum.photos/seed/user/32/32'}
                  alt={user?.displayName || 'user'}
                />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
