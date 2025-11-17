'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { Button } from '@/components/ui/button';
import { summarizeComments } from '@/ai/flows/summarize-comments';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pilcrow, ListTree } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SummaryTab() {
  const {
    selectedPresentation,
    comments,
    summary,
    setSummary,
    isSummarizing,
    setIsSummarizing,
  } = useDashboard();
  const { toast } = useToast();

  const handleSummarize = async (type: 'overall' | 'slide-by-slide') => {
    if (comments.length === 0) {
      toast({
        title: 'Error',
        description: 'No comments to summarize. Please run an analysis first.',
        variant: 'destructive',
      });
      return;
    }
    setIsSummarizing(true);
    setSummary('');
    try {
      const result = await summarizeComments({
        comments: comments.map(
          (c) => `Slide ${c.slideNumber}: ${c.commentText}`
        ),
        summaryType: type,
        slideTitles: selectedPresentation?.slides.map((s) => s.title),
      });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Summarization Failed',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex gap-2">
        <Button
          onClick={() => handleSummarize('overall')}
          disabled={isSummarizing || comments.length === 0}
          className="w-full"
          variant="outline"
        >
          {isSummarizing ? <Loader2 className="animate-spin" /> : <Pilcrow />}
          Overall Summary
        </Button>
        <Button
          onClick={() => handleSummarize('slide-by-slide')}
          disabled={isSummarizing || comments.length === 0}
          className="w-full"
          variant="outline"
        >
          {isSummarizing ? <Loader2 className="animate-spin" /> : <ListTree />}
          By Slide
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <h3 className="font-semibold mb-2">Summary</h3>
        <Card className="h-full max-h-[calc(85vh-150px)]">
          <ScrollArea className="h-full">
            <CardContent className="p-4">
              {isSummarizing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {!isSummarizing && !summary && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Generate a summary to see it here.</p>
                </div>
              )}
              {summary && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: summary.replace(/\n/g, '<br />'),
                  }}
                />
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
