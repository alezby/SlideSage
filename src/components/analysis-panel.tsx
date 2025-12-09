'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisTab from './analysis-tab';
import SummaryTab from './summary-tab';
import ChatTab from './chat-tab';
import CreateTab from './create-tab';
import ResearchTab from './research-tab';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function AnalysisPanel() {
  const [activeTab, setActiveTab] = useState('analysis');
  const router = useRouter();

  return (
    <Card className="h-full max-h-[85vh] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-lg">AI Assistant</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-muted-foreground hover:text-primary"
          onClick={() => router.push('/dashboard/visualization')}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Visualize Report</span>
        </Button>
      </div>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="p-2 shrink-0">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="analysis">Analyze</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chat">Refine</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="analysis"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <AnalysisTab onAnalysisComplete={() => setActiveTab('chat')} />
          </TabsContent>
          <TabsContent
            value="summary"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <SummaryTab />
          </TabsContent>
          <TabsContent
            value="chat"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <ChatTab />
          </TabsContent>
          <TabsContent
            value="create"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <CreateTab />
          </TabsContent>
          <TabsContent
            value="research"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <ResearchTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
