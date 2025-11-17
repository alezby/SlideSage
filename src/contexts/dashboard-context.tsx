'use client';

import type { Presentation } from '@/lib/data';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

export type Comment = {
  slideNumber: number;
  commentText: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type DashboardContextType = {
  presentations: Presentation[];
  selectedPresentation: Presentation | null;
  setSelectedPresentation: Dispatch<SetStateAction<Presentation | null>>;
  currentSlideIndex: number;
  setCurrentSlideIndex: Dispatch<SetStateAction<number>>;
  comments: Comment[];
  setComments: Dispatch<SetStateAction<Comment[]>>;
  analysisPrompt: string;
  setAnalysisPrompt: Dispatch<SetStateAction<string>>;
  summary: string;
  setSummary: Dispatch<SetStateAction<string>>;
  chatHistory: ChatMessage[];
  setChatHistory: Dispatch<SetStateAction<ChatMessage[]>>;
  isAnalyzing: boolean;
  setIsAnalyzing: Dispatch<SetStateAction<boolean>>;
  isSummarizing: boolean;
  setIsSummarizing: Dispatch<SetStateAction<boolean>>;
  isChatting: boolean;
  setIsChatting: Dispatch<SetStateAction<boolean>>;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({
  children,
  presentations: initialPresentations,
}: {
  children: ReactNode;
  presentations: Presentation[];
}) {
  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(initialPresentations[0] || null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [analysisPrompt, setAnalysisPrompt] = useState(
    'Check for brand identity consistency. Our brand uses a confident and professional tone, with blue and green as primary colors. Ensure all text is concise.'
  );
  const [summary, setSummary] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const value = {
    presentations: initialPresentations,
    selectedPresentation,
    setSelectedPresentation,
    currentSlideIndex,
    setCurrentSlideIndex,
    comments,
    setComments,
    analysisPrompt,
    setAnalysisPrompt,
    summary,
    setSummary,
    chatHistory,
    setChatHistory,
    isAnalyzing,
    setIsAnalyzing,
    isSummarizing,
    setIsSummarizing,
    isChatting,
    setIsChatting,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
