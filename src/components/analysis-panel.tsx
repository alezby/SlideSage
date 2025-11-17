'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalysisTab from './analysis-tab';
import SummaryTab from './summary-tab';
import ChatTab from './chat-tab';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalysisPanel() {
  return (
    <Card className="h-full max-h-[85vh]">
      <CardContent className="p-0 h-full">
        <Tabs defaultValue="analysis" className="h-full flex flex-col">
          <div className="p-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Analyze</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chat">Refine</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="analysis"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <AnalysisTab />
          </TabsContent>
          <TabsContent
            value="summary"
            className="flex-1 overflow-auto p-4 pt-0 mt-0"
          >
            <SummaryTab />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 overflow-auto p-4 pt-0 mt-0">
            <ChatTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
