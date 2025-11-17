'use server';
/**
 * @fileOverview A conversational agent that can use tools to interact with the presentation.
 *
 * - conversationalAgent - The main flow function for the agent.
 * - ConversationalAgentInput - The input type for the flow.
 * - ConversationalAgentOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { addCommentToSlide as addCommentToSlideService, createSlide as createSlideService } from '@/services/google-slides';
import { z } from 'genkit';

// Define the schema for a single comment object
const CommentSchema = z.object({
  slideNumber: z.number().describe('The slide number the comment applies to.'),
  commentText: z.string().describe('The text of the comment to be added.'),
});

const SlideSchema = z.object({
  title: z.string().describe('The title of the new slide.'),
  content: z.string().describe('The main content/body of the new slide.'),
});


const ConversationalAgentInputSchema = z.object({
  prompt: z.string().describe('The user\'s latest message.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The history of the conversation.'),
  slideNumber: z.number().optional().describe('The current slide number being viewed.'),
  slideContent: z.string().optional().describe('The text content of the current slide.'),
  analysisPrompt: z.string().optional().describe('The overall analysis goal set by the user.'),
  presentationId: z.string().describe('The ID of the Google Slides presentation.'),
  slideId: z.string().optional().describe('The ID of the current slide page object.'),
  accessToken: z.string().describe('The Google OAuth2 access token for API calls.'),
});
export type ConversationalAgentInput = z.infer<typeof ConversationalAgentInputSchema>;

const ConversationalAgentOutputSchema = z.object({
  response: z.string().describe('The agent\'s response to the user.'),
  commentAdded: CommentSchema.optional().describe('The comment that was added by the agent, if any.'),
  slideAdded: z.object({ slideId: z.string() }).optional().describe('The ID of the slide that was created.'),
});
export type ConversationalAgentOutput = z.infer<typeof ConversationalAgentOutputSchema>;

// This is the primary function the client will call.
export async function conversationalAgent(input: ConversationalAgentInput): Promise<ConversationalAgentOutput> {
  return conversationalAgentFlow(input);
}

// 1. Define the tools that the agent can use.
const addCommentToSlideTool = ai.defineTool(
  {
    name: 'addCommentToSlide',
    description: 'Adds a comment to a specific slide in the presentation.',
    inputSchema: z.object({
      commentText: z.string().describe('The constructive feedback or comment to add to the slide.'),
      slideNumber: z.number().describe('The slide number to add the comment to.'),
    }),
    outputSchema: z.string(),
  },
  async ({ commentText, slideNumber }, context) => {
    if (!context || !context.auth) {
      throw new Error('User authentication context is required to add a comment.');
    }
    const { presentationId, slideId, accessToken } = context.auth as ConversationalAgentInput;

    if (!presentationId || !slideId || !accessToken) {
      return 'Error: Missing presentation, slide, or authentication details.';
    }
    
    try {
      await addCommentToSlideService(accessToken, presentationId, slideId, commentText);
      return `Successfully added comment to slide ${slideNumber}.`;
    } catch (e: any) {
      console.error("Tool execution failed:", e);
      return `Failed to add comment. Error: ${e.message}`;
    }
  }
);

const createSlideTool = ai.defineTool(
  {
    name: 'createSlide',
    description: 'Creates a new slide with a title and content in the presentation.',
    inputSchema: SlideSchema,
    outputSchema: z.string(),
  },
  async({ title, content }, context) => {
     if (!context || !context.auth) {
      throw new Error('User authentication context is required to create a slide.');
    }
    const { presentationId, accessToken } = context.auth as ConversationalAgentInput;
     if (!presentationId || !accessToken) {
      return 'Error: Missing presentation or authentication details.';
    }

    try {
      const newSlideId = await createSlideService(accessToken, presentationId, title, content);
      return `Successfully created a new slide with ID ${newSlideId}.`;
    } catch (e: any) {
      console.error("Tool execution failed for createSlide:", e);
      return `Failed to create slide. Error: ${e.message}`;
    }
  }
);


// 2. Define the main flow that uses the tools.
const conversationalAgentFlow = ai.defineFlow(
  {
    name: 'conversationalAgentFlow',
    inputSchema: ConversationalAgentInputSchema,
    outputSchema: ConversationalAgentOutputSchema,
  },
  async (input) => {
    // 3. Call the model with the prompt, tools, and conversation history.
    const { text, toolRequests } = await ai.generate({
      prompt: `You are a presentation assistant. You have two tools: 'addCommentToSlide' and 'createSlide'.
      - The user may be asking for analysis based on this goal: "${input.analysisPrompt}".
      - The user may be viewing Slide ${input.slideNumber}, which contains: "${input.slideContent}".
      - Your job is to answer the user's questions and use your tools when appropriate.
      
      Tool Usage Rules:
      - Add Comment: If the user asks you to add a comment, you MUST ask them what they want the comment to say if they haven't provided the text. Once they provide the text, use the 'addCommentToSlide' tool.
      - Create Slide: If the user asks you to create a slide, you MUST ask for the title and the content for the slide if they haven't provided it. Once you have both, use the 'createSlide' tool.
      - When you successfully use a tool, respond with a simple confirmation message.
      - Do not ask for confirmation before using a tool if you have all the required information.`,
      model: 'googleai/gemini-2.5-flash',
      history: input.history,
      tools: [addCommentToSlideTool, createSlideTool],
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
    let slideAdded: { slideId: string } | undefined = undefined;


    // 4. Check if the model requested to use a tool.
    if (toolRequests.length > 0) {
      for (const toolRequest of toolRequests) {
        
        // Handle addCommentToSlide tool
        if (toolRequest.name === 'addCommentToSlide') {
          const { commentText, slideNumber } = toolRequest.input;
          await toolRequest.run();
          commentAdded = { slideNumber: slideNumber || input.slideNumber!, commentText };
        }

        // Handle createSlide tool
        if (toolRequest.name === 'createSlide') {
          const { title, content } = toolRequest.input;
          const result = await toolRequest.run() as string; // result is the success message with the ID
          const slideIdMatch = result.match(/ID (\S+)/);
          if (slideIdMatch) {
            slideAdded = { slideId: slideIdMatch[1] };
          }
        }
      }
    }
    
    // 5. Return the final response and any actions taken.
    return {
      response: text,
      commentAdded: commentAdded,
      slideAdded: slideAdded,
    };
  }
);
