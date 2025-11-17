'use server';

/**
 * @fileOverview Implements a conversational agent for refining analysis prompts and reviewing results.
 *
 * refineAnalysisWithConversation - A function that drives the conversation to refine analysis.
 * RefineAnalysisWithConversationInput - The input type for the refineAnalysisWithConversation function.
 * RefineAnalysisWithConversationOutput - The return type for the refineAnalysisWithConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineAnalysisWithConversationInputSchema = z.object({
  initialPrompt: z.string().describe('The initial analysis prompt provided by the user.'),
  slideContent: z.string().describe('The content of the slide to be analyzed.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});

export type RefineAnalysisWithConversationInput = z.infer<typeof RefineAnalysisWithConversationInputSchema>;

const RefineAnalysisWithConversationOutputSchema = z.object({
  refinedAnalysis: z.string().describe('The refined analysis of the slide content based on the conversation.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The updated history of the conversation.'),
});

export type RefineAnalysisWithConversationOutput = z.infer<typeof RefineAnalysisWithConversationOutputSchema>;

export async function refineAnalysisWithConversation(input: RefineAnalysisWithConversationInput): Promise<RefineAnalysisWithConversationOutput> {
  return refineAnalysisWithConversationFlow(input);
}

const refineAnalysisWithConversationPrompt = ai.definePrompt({
  name: 'refineAnalysisWithConversationPrompt',
  input: {
    schema: RefineAnalysisWithConversationInputSchema,
  },
  output: {
    schema: RefineAnalysisWithConversationOutputSchema,
  },
  prompt: `You are a helpful assistant that helps refine an analysis of slide content based on a user-provided prompt.
  Analyze the slide content based on the current analysis prompt and the conversation history.

  Slide Content: {{{slideContent}}}
  Current Analysis Prompt: {{{initialPrompt}}}
  Conversation History:
  {{#each conversationHistory}}
  {{this.role}}: {{this.content}}
  {{/each}}

  Refined Analysis:`,
});

const refineAnalysisWithConversationFlow = ai.defineFlow(
  {
    name: 'refineAnalysisWithConversationFlow',
    inputSchema: RefineAnalysisWithConversationInputSchema,
    outputSchema: RefineAnalysisWithConversationOutputSchema,
  },
  async input => {
    const {output} = await refineAnalysisWithConversationPrompt(input);

    const newConversationHistory = [...(input.conversationHistory || []), {
      role: 'assistant',
      content: output!.refinedAnalysis,
    }];

    return {
      refinedAnalysis: output!.refinedAnalysis,
      conversationHistory: newConversationHistory,
    };
  }
);
