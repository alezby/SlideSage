'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import AnalysisPanel from './analysis-panel';

export default function SlideViewer() {
  const { selectedPresentation } = useDashboard();

  if (!selectedPresentation) {
    return null;
  }

  const embedUrl = `https://docs.google.com/presentation/d/${selectedPresentation.id}/embed?start=false&loop=false&delayms=3000`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      <div className="lg:col-span-3 h-full">
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={embedUrl}
            frameBorder="0"
            width="100%"
            height="100%"
            allowFullScreen={true}
          ></iframe>
        </div>
        <div className="text-center text-muted-foreground p-4">
            <p className="font-bold">Editing Tip:</p>
            <p className="text-sm">
                Use the embedded slide controls to navigate. You may need to manually update the current slide in the "Refine" tab for the AI to have the correct context.
            </p>
        </div>
      </div>
      <div className="lg:col-span-2 h-full">
        <AnalysisPanel />
      </div>
    </div>
  );
}
