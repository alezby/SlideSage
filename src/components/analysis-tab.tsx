'use client';
import { useDashboard } from '@/contexts/dashboard-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileScan, Loader2 } from 'lucide-react';
import { analyzePresentationAndAddComments } from '@/ai/flows/analyze-presentation-and-add-comments';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AnalysisTab() {
  const {
    selectedPresentation,
    analysisPrompt,
    setAnalysisPrompt,
    comments,
    setComments,
    isAnalyzing,
    setIsAnalyzing,
    setCurrentSlideIndex,
  } = useDashboard();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!selectedPresentation) {
      toast({
        title: 'Error',
        description: 'Please select a presentation first.',
        variant: 'destructive',
      });
      return;
    }
    setIsAnalyzing(true);
    setComments([]);
    try {
      const presentationContent = selectedPresentation.slides
        .map((s, i) => `Slide ${i + 1}: ${s.title}\n${s.content}`)
        .join('\n\n');
      const result = await analyzePresentationAndAddComments({
        presentationContent,
        prompt: analysisPrompt,
      });
      setComments(result.comments);
      if (result.comments.length > 0) {
        toast({
          title: 'Analysis Complete',
          description: `${result.comments.length} suggestions found.`,
        });
        setCurrentSlideIndex(result.comments[0].slideNumber - 1);
      } else {
        toast({
          title: 'Analysis Complete',
          description: 'No suggestions found.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Analysis Failed',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div>
        <Label htmlFor="analysis-prompt" className="font-semibold">
          Analysis Prompt
        </Label>
        <Textarea
          id="analysis-prompt"
          placeholder="e.g., Check for brand consistency..."
          value={analysisPrompt}
          onChange={(e) => setAnalysisPrompt(e.target.value)}
          className="mt-2 min-h-[120px]"
        />
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedPresentation}
          className="w-full mt-2"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" /> : <FileScan />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Presentation'}
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <h3 className="font-semibold mb-2">Comments</h3>
        <ScrollArea className="h-full max-h-[calc(85vh-280px)] pr-4 -mr-4">
          <div className="space-y-4">
            {isAnalyzing && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isAnalyzing && comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No comments yet. Run an analysis to get feedback.</p>
              </div>
            )}
            {comments.map((comment, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:bg-muted"
                onClick={() => setCurrentSlideIndex(comment.slideNumber - 1)}
              >
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                    {comment.slideNumber}
                  </div>
                  <div className="flex-1">
                    <CardDescription>{comment.commentText}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
