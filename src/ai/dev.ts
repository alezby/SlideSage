import { config } from 'dotenv';
config();

// Make sure all flows are imported here
import '@/ai/flows/summarize-comments.ts';
import '@/ai/flows/refine-analysis-with-conversational-agent.ts';
import '@/ai/flows/analyze-presentation-and-add-comments.ts';
import '@/ai/flows/conversational-agent.ts';
import '@/ai/flows/google-search-agent.ts';
