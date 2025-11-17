'use server';
/**
 * @fileOverview Analyzes a Google Slides presentation and adds comments based on a user-provided prompt.
 *
 * - analyzePresentationAndAddComments - A function that handles the analysis and commenting process.
 * - AnalyzePresentationAndAddCommentsInput - The input type for the analyzePresentationAndAddComments function.
 * - AnalyzePresentationAndAddCommentsOutput - The return type for the analyzePresentationAndAddComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePresentationAndAddCommentsInputSchema = z.object({
  presentationContent: z.string().describe('The entire text of the Google Slides presentation.'),
  prompt: z.string().describe('The prompt to use for analyzing the presentation (e.g., brand consistency).'),
});
export type AnalyzePresentationAndAddCommentsInput = z.infer<typeof AnalyzePresentationAndAddCommentsInputSchema>;

const AnalyzePresentationAndAddCommentsOutputSchema = z.object({
  comments: z.array(
    z.object({
      slideNumber: z.number().describe('The slide number the comment applies to.'),
      commentText: z.string().describe('The comment text suggested by the LLM.'),
    })
  ).describe('An array of comments to add to the Google Slides presentation.'),
});
export type AnalyzePresentationAndAddCommentsOutput = z.infer<typeof AnalyzePresentationAndAddCommentsOutputSchema>;

export async function analyzePresentationAndAddComments(
  input: AnalyzePresentationAndAddCommentsInput
): Promise<AnalyzePresentationAndAddCommentsOutput> {
  return analyzePresentationAndAddCommentsFlow(input);
}

const analyzePresentationPrompt = ai.definePrompt({
  name: 'analyzePresentationPrompt',
  input: {schema: AnalyzePresentationAndAddCommentsInputSchema},
  output: {schema: AnalyzePresentationAndAddCommentsOutputSchema},
  prompt: `You are an expert presentation analyst. You will analyze a Google Slides presentation and provide comments based on a user-provided prompt.

  Presentation Content: {{{presentationContent}}}
  Prompt: {{{prompt}}}

  Based on the prompt, identify slides where changes are suggested and provide a comment for each slide.
  If no changes are needed for a slide, do not include it in the comments.

  Format your response as a JSON array of comments, where each comment includes the slide number and the comment text.
  For example:
  [
    {
      "slideNumber": 1,
      "commentText": "Consider adding a stronger call to action on this slide."
    },
    {
      "slideNumber": 3,
      "commentText": "The color scheme on this slide does not align with the brand guidelines."
    }
  ]
  `,
});

const analyzePresentationAndAddCommentsFlow = ai.defineFlow(
  {
    name: 'analyzePresentationAndAddCommentsFlow',
    inputSchema: AnalyzePresentationAndAddCommentsInputSchema,
    outputSchema: AnalyzePresentationAndAddCommentsOutputSchema,
  },
  async input => {
    const {output} = await analyzePresentationPrompt(input);
    return output!;
  }
);
