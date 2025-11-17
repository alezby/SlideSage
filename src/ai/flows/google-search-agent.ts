'use server';
/**
 * @fileOverview A conversational agent that can use Google Search.
 *
 * - googleSearchAgent - The main flow function for the agent.
 * - GoogleSearchAgentInput - The input type for the flow.
 * - GoogleSearchAgentOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GoogleSearchAgentInputSchema = z.object({
  prompt: z.string().describe("The user's query or question."),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
});
export type GoogleSearchAgentInput = z.infer<typeof GoogleSearchAgentInputSchema>;

const GoogleSearchAgentOutputSchema = z.object({
  response: z.string().describe("The agent's response to the user."),
});
export type GoogleSearchAgentOutput = z.infer<typeof GoogleSearchAgentOutputSchema>;

export async function googleSearchAgent(input: GoogleSearchAgentInput): Promise<GoogleSearchAgentOutput> {
  return googleSearchAgentFlow(input);
}

// This is a placeholder for a real search tool.
// In a real application, this would make an API call to a search engine.
const googleSearch = ai.defineTool(
  {
    name: 'googleSearch',
    description: 'Performs a Google search to find up-to-date information on a topic.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string(),
  },
  async ({ query }) => {
    // In a real implementation, you would use a library like 'google-search' or 'serpapi'
    // and make an actual API call here.
    // For this example, we'll return a mocked result.
    console.log(`(Mock) Searching Google for: ${query}`);
    return `According to a mock search for "${query}", recent trends show increasing adoption of AI in presentation software. Key areas include automated design suggestions, content summarization, and real-time feedback.`;
  }
);

const googleSearchAgentFlow = ai.defineFlow(
  {
    name: 'googleSearchAgentFlow',
    inputSchema: GoogleSearchAgentInputSchema,
    outputSchema: GoogleSearchAgentOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `You are a helpful research assistant. Use the Google Search tool to answer the user's question if it requires recent information.`,
      model: 'googleai/gemini-2.5-flash',
      history: input.history,
      tools: [googleSearch],
    });

    return {
      response: text,
    };
  }
);
