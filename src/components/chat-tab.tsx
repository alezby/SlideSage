'use client';
import { useDashboard, type ChatMessage } from '@/contexts/dashboard-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { conversationalAgent } from '@/ai/flows/conversational-agent';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function ChatTab() {
  const {
    selectedPresentation,
    currentSlideIndex,
    analysisPrompt,
    chatHistory,
    setChatHistory,
    isChatting,
    setIsChatting,
    setComments,
    comments,
  } = useDashboard();
  const { toast } = useToast();
  const [userInput, setUserInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory, isChatting]);


  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !selectedPresentation) return;

    const currentSlide = selectedPresentation.slides[currentSlideIndex];
    if (!currentSlide) {
      toast({
        title: 'Error',
        description: 'No slide selected for refinement.',
        variant: 'destructive',
      });
      return;
    }

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    const newHistory = [...chatHistory, newUserMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setIsChatting(true);

    try {
      const result = await conversationalAgent({
        prompt: userInput,
        slideNumber: currentSlideIndex + 1,
        slideContent: `${currentSlide.title}\n${currentSlide.content}`,
        analysisPrompt,
        history: chatHistory,
      });

      // Update chat history with the agent's response
      const agentResponse: ChatMessage = { role: 'assistant', content: result.response };
      setChatHistory([...newHistory, agentResponse]);

      // If the agent added a comment, update the comments list
      if (result.commentAdded) {
        setComments(prevComments => [...prevComments, result.commentAdded!].sort((a,b) => a.slideNumber - b.slideNumber));
        toast({
          title: 'Comment Added',
          description: `A new comment was added to slide ${result.commentAdded.slideNumber}.`,
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        title: 'Chat Failed',
        description: 'Something went wrong.',
        variant: 'destructive',
      });
      setChatHistory(chatHistory); // Revert history on error
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full max-h-[calc(85vh-150px)]" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  Ask the agent to add comments or refine analysis for the current slide.
                </p>
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isChatting && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot size={20} />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <form onSubmit={handleChat} className="mt-auto flex gap-2 border-t pt-4">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          disabled={isChatting || !selectedPresentation}
        />
        <Button type="submit" size="icon" disabled={isChatting || !userInput.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
