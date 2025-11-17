'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { googleSearchAgent } from '@/ai/flows/google-search-agent';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, User, Bot } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/contexts/dashboard-context';

export default function ResearchTab() {
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
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    const newHistory = [...chatHistory, newUserMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setIsChatting(true);

    try {
      const result = await googleSearchAgent({
        prompt: userInput,
        history: chatHistory,
      });

      const agentResponse: ChatMessage = { role: 'assistant', content: result.response };
      setChatHistory([...newHistory, agentResponse]);

    } catch (error) {
      console.error(error);
      toast({
        title: 'Chat Failed',
        description: 'Something went wrong while talking to the research agent.',
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
                  Ask the research agent a question that requires up-to-date information.
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
          placeholder="Ask about recent trends..."
          disabled={isChatting}
        />
        <Button type="submit" size="icon" disabled={isChatting || !userInput.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
