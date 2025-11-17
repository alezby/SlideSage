'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, FileText, Loader2 } from 'lucide-react';
import { getPresentations } from '@/services/google-slides';
import { useToast } from '@/hooks/use-toast';
import type { Presentation } from '@/lib/data';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSelect = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    // Reset state when a new presentation is selected
    setComments([]);
    setSummary('');
    setCurrentSlideIndex(0);
    setPopoverOpen(false);
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

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleFetchPresentations} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          'Connect Google Drive'
        )}
      </Button>

      {presentations.length > 0 && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpen}
              className="w-[250px] justify-between"
            >
              {selectedPresentation
                ? selectedPresentation.title
                : 'Select a presentation...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search presentations..." />
              <CommandList>
                <CommandEmpty>No presentations found.</CommandEmpty>
                <CommandGroup>
                  {presentations.map(pres => (
                    <CommandItem
                      key={pres.id}
                      onSelect={() => handleSelect(pres)}
                      value={pres.title}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedPresentation?.id === pres.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="truncate">{pres.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
