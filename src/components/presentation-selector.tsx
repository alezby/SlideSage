'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { getPresentations } from '@/services/google-slides';
import { useToast } from '@/hooks/use-toast';
import type { Presentation } from '@/lib/data';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function PresentationSelector() {
  const {
    presentations,
    setPresentations,
    selectedPresentation,
    setSelectedPresentation,
    setComments,
    setSummary,
    setCurrentSlideIndex,
  } = useDashboard();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    // Reset state when a new presentation is selected
    setComments([]);
    setSummary('');
    setCurrentSlideIndex(0);
  };

  const handleFetchPresentations = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('google_access_token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Google access token not found. Please sign in again.',
          variant: 'destructive',
        });
        return;
      }
      const fetchedPresentations = await getPresentations(token);
      setPresentations(fetchedPresentations);
      toast({
        title: 'Success',
        description: `Fetched ${fetchedPresentations.length} presentations.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to fetch presentations from Google Drive.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredPresentations = presentations.filter((pres) =>
    pres.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Presentations
        </h2>
      </div>
      <div className="px-2 mb-2">
        <Button onClick={handleFetchPresentations} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : 'Connect Google Drive'}
        </Button>
      </div>
      {presentations.length > 0 && (
        <div className="px-2 mb-2">
          <Input
            placeholder="Search presentations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}
      <SidebarMenu>
        {filteredPresentations.map((pres) => (
          <SidebarMenuItem key={pres.id}>
            <SidebarMenuButton
              onClick={() => handleSelect(pres)}
              isActive={selectedPresentation?.id === pres.id}
            >
              <FileText />
              <span>{pres.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
