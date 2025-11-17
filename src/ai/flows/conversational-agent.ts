'use server';
/**
 * @fileOverview A conversational agent that can use tools to interact with the presentation.
 *
 * - conversationalAgent - The main flow function for the agent.
 * - ConversationalAgentInput - The input type for the flow.
 * - ConversationalAgentOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
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
    description: 'Adds a comment to a specific slide in the presentation.',
    inputSchema: z.object({
      slideNumber: z.number().describe('The slide number to add the comment to. This should be the current slide number.'),
      commentText: z.string().describe('The constructive feedback or comment to add to the slide.'),
    }),
    outputSchema: z.string(),
  },
  async ({ slideNumber, commentText }) => {
    // In a real application, this would call the Google Slides API to add a comment.
    // For this demo, we will simulate this by returning the comment data.
    // The flow will then pass this back to the client.
    return `Successfully added comment to slide ${slideNumber}.`;
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
      Only use the tool if the user explicitly asks to add a comment or note. When you use the tool, respond with a confirmation message.`,
      model: 'googleai/gemini-2.5-flash',
      history: input.history,
      tools: [addCommentToSlideTool],
      config: {
        // Lower temperature for more predictable, less creative responses when using tools
        temperature: 0.1,
      },
    });

    let commentAdded: z.infer<typeof CommentSchema> | undefined = undefined;

    // 4. Check if the model requested to use a tool.
    if (toolRequests.length > 0) {
      for (const toolRequest of toolRequests) {
        if (toolRequest.name === 'addCommentToSlide') {
          // Get the arguments the model wants to call the tool with.
          const { slideNumber, commentText } = toolRequest.input;

          // Call the tool. In this simulation, it doesn't do anything but return a string.
          await toolRequest.run();

          // Prepare the comment to be sent back to the client UI.
          commentAdded = { slideNumber, commentText };
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
