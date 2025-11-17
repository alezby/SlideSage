'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { FileText } from 'lucide-react';

export default function PresentationSelector() {
  const {
    presentations,
    selectedPresentation,
    setSelectedPresentation,
    setComments,
    setSummary,
    setCurrentSlideIndex,
  } = useDashboard();

  const handleSelect = (presentation: (typeof presentations)[0]) => {
    setSelectedPresentation(presentation);
    // Reset state when a new presentation is selected
    setComments([]);
    setSummary('');
    setCurrentSlideIndex(0);
  };

  return (
    <div className="px-2">
      <h2 className="px-2 text-lg font-semibold tracking-tight mb-2">
        Presentations
      </h2>
      <SidebarMenu>
        {presentations.map((pres) => (
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
