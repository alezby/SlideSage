'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisTab from './analysis-tab';
import SummaryTab from './summary-tab';
import ChatTab from './chat-tab';
import CreateTab from './create-tab';
import ResearchTab from './research-tab';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export default function AnalysisPanel() {
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <Card className="h-full max-h-[85vh]">
      <CardContent className="p-0 h-full">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="p-2">
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
