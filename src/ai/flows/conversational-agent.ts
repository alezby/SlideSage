'use server';
/**
 * @fileOverview A conversational agent that can use tools to interact with the presentation.
 *
 * - conversationalAgent - The main flow function for the agent.
 * - ConversationalAgentInput - The input type for the flow.
 * - ConversationalAgentOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { addCommentToSlide as addCommentToSlideService } from '@/services/google-slides';
import { z } from 'genkit';

// Define the schema for a single comment object
const CommentSchema = z.object({
  slideNumber: z.number().describe('The slide number the comment applies to.'),
  commentText: z.string().describe('The text of the comment to be added.'),
});

const ConversationalAgentInputSchema = z.object({
  prompt: z.string().describe('The user\'s latest message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
  slideNumber: z.number().describe('The current slide number being viewed.'),
  slideContent: z.string().describe('The text content of the current slide.'),
  analysisPrompt: z.string().describe('The overall analysis goal set by the user.'),
  presentationId: z.string().describe('The ID of the Google Slides presentation.'),
  slideId: z.string().describe('The ID of the current slide page object.'),
  accessToken: z.string().describe('The Google OAuth2 access token for API calls.'),
});
export type ConversationalAgentInput = z.infer<typeof ConversationalAgentInputSchema>;

const ConversationalAgentOutputSchema = z.object({
  response: z.string().describe('The agent\'s response to the user.'),
  commentAdded: CommentSchema.optional().describe('The comment that was added by the agent, if any.'),
});
export type ConversationalAgentOutput = z.infer<typeof ConversationalAgentOutputSchema>;

// This is the primary function the client will call.
export async function conversationalAgent(input: ConversationalAgentInput): Promise<ConversationalAgentOutput> {
  return conversationalAgentFlow(input);
}

// 1. Define the tool that the agent can use.
const addCommentToSlideTool = ai.defineTool(
  {
    name: 'addCommentToSlide',
    description: 'Adds a comment to a specific slide in the presentation. This is the only tool available.',
    inputSchema: z.object({
      commentText: z.string().describe('The constructive feedback or comment to add to the slide.'),
    }),
    outputSchema: z.string(),
  },
  async ({ commentText }, context) => {
    if (!context || !context.auth) {
      throw new Error('User authentication context is required to add a comment.');
    }
    const { presentationId, slideId, accessToken } = context.auth as ConversationalAgentInput;

    if (!presentationId || !slideId || !accessToken) {
      return 'Error: Missing presentation, slide, or authentication details.';
    }
    
    try {
      await addCommentToSlideService(accessToken, presentationId, slideId, commentText);
      return `Successfully added comment to slide.`;
    } catch (e: any) {
      console.error("Tool execution failed:", e);
      return `Failed to add comment. Error: ${e.message}`;
    }
  }
);


// 2. Define the main flow that uses the tool.
const conversationalAgentFlow = ai.defineFlow(
  {
    name: 'conversationalAgentFlow',
    inputSchema: ConversationalAgentInputSchema,
    outputSchema: ConversationalAgentOutputSchema,
  },
  async (input) => {
    // 3. Call the model with the prompt, tools, and conversation history.
    const { text, toolRequests } = await ai.generate({
      prompt: `You are a presentation assistant. The user wants you to help them improve their presentation based on this goal: "${input.analysisPrompt}".
      The user is currently viewing Slide ${input.slideNumber}, which contains: "${input.slideContent}".
      Your job is to answer the user's questions and, if asked, use the addCommentToSlide tool to add comments to the current slide.
      
      - If the user asks you to add a comment but does not provide the text for the comment, you MUST ask them what they want the comment to say.
      - If the user provides the text for the comment, use the addCommentToSlide tool directly. Do not ask for confirmation.
      - When you successfully use the tool, respond with a simple confirmation message that the comment was added.`,
      model: 'googleai/gemini-2.5-flash',
      history: input.history,
      tools: [addCommentToSlideTool],
      config: {
        temperature: 0.1,
      },
      // Pass required info for the tool to the context
      context: {
        auth: {
          presentationId: input.presentationId,
          slideId: input.slideId,
          accessToken: input.accessToken,
        }
      }
    });

    let commentAdded: z.infer<typeof CommentSchema> | undefined = undefined;

    // 4. Check if the model requested to use a tool.
    if (toolRequests.length > 0) {
      for (const toolRequest of toolRequests) {
        if (toolRequest.name === 'addCommentToSlide') {
          // Get the arguments the model wants to call the tool with.
          const { commentText } = toolRequest.input;

          // Call the tool. This will execute the function defined in `ai.defineTool`.
          await toolRequest.run();

          // Prepare the comment to be sent back to the client UI for optimistic update.
          commentAdded = { slideNumber: input.slideNumber, commentText };
        }
      }
    }
    
    // 5. Return the final response and any comment that was added.
    return {
      response: text,
      commentAdded: commentAdded,
    };
  }
);
