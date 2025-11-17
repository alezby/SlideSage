'use client';
import { useDashboard, type ChatMessage } from '@/contexts/dashboard-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { conversationalAgent } from '@/ai/flows/conversational-agent';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, User, Bot, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function CreateTab() {
  const {
    selectedPresentation,
    setPresentations,
  } = useDashboard();
  const { toast } = useToast();
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
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
    
    const accessToken = sessionStorage.getItem('google_access_token');
    if (!accessToken) {
        toast({
            title: 'Authentication Error',
            description: 'Google access token not found. Please sign in again.',
            variant: 'destructive'
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
        history: chatHistory,
        presentationId: selectedPresentation.id,
        accessToken,
      });

      // Update chat history with the agent's response
      const agentResponse: ChatMessage = { role: 'assistant', content: result.response };
      setChatHistory([...newHistory, agentResponse]);

      // If the agent added a slide, show a toast and refresh presentations
      if (result.slideAdded) {
        toast({
          title: 'Slide Created',
          description: 'A new slide has been added to your presentation. Refreshing presentation list...',
        });
        // This is a simple way to refresh. A more advanced implementation
        // might update the presentation object in-place.
        document.getElementById('fetch-presentations-button')?.click();
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
                  Ask the agent to create a new slide. For example: "Create a slide with the title 'My New Idea' and the content 'This is my brilliant new idea.'"
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
          placeholder="e.g., Create a slide about..."
          disabled={isChatting || !selectedPresentation}
        />
        <Button type="submit" size="icon" disabled={isChatting || !userInput.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
