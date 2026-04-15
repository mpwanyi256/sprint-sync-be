import OpenAI from 'openai';
import { openAIKey } from '../../config';
import { streamHandler } from '../../core/StreamHandler';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: openAIKey,
    });
  }

  async generateTaskDescription(title: string, description?: string) {
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    return this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `
      You are an expert product manager and engineering triage specialist.

      Your task is to transform the given task into a detailed, structured, and actionable report in HTML.

      CRITICAL RULES:
      - DO NOT summarize the input into a shorter version.
      - DO NOT reduce the content to one sentence.
      - You MUST preserve and expand ALL important details from the input.
      - Prefer rewriting and structuring over shortening.
      - The description is the source of truth — extract from it fully.

      CLASSIFICATION:
      - Classify as one of: Bug, Feature, Improvement, Task

      GROUNDING:
      - Use ONLY the provided information
      - DO NOT invent new causes or fixes
      - If "Likely cause" exists → include it
      - If "Suggested fix" exists → include it

      DEPTH REQUIREMENTS:
      - Problem section MUST include:
        - What is happening
        - Where it happens (if mentioned)
        - Specific example from the input
      - Likely Cause MUST be clearly rewritten, not shortened
      - Suggested Fix MUST be broken into multiple actionable steps

      HTML RULES:
      - Output HTML only
      - First character MUST be <
      - Use ONLY: <h3>, <p>, <ul>, <li>, <strong>
      - No markdown, no plain text

      STRUCTURE (MANDATORY):
      <h3>{TYPE}</h3>
      <br /><br />

      <h3>Problem</h3>
      <p>Brief explanation...</p>
      <p>Include concrete example from input if available and be as brief as possible...</p>
      <br /><br />

      <h3>Likely Cause</h3>
      <p>Clear explanation...</p>
      <br /><br />

      <h3>Suggested Fix</h3>
      <ul>
        <li>Step 1</li>
        <li>Step 2</li>
        <li>Step 3</li>
      </ul>
      <br /><br />

      IMPORTANT:
      - If the input includes examples (like truncated text), you MUST include them in the Problem section.
      - NEVER collapse multi-paragraph input into a single sentence.
      - The output should feel like a well-written engineering ticket, not a summary.
            `,
        },
        {
          role: 'user',
          content: `
      Task Title: ${title}

      Description:
      ${description}

      Rewrite this into a detailed structured HTML task description.
            `,
        },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.3,
    });
  }

  async generateTaskDescriptionWithStreamHandler(title: string) {
    if (!openAIKey) {
      // Return mock response when AI is not configured
      return streamHandler.createMockStreamResponse(
        `Create a comprehensive task description for: ${title}. This task involves planning, implementation, and testing phases.`
      );
    }

    try {
      const stream = await this.generateTaskDescription(title);
      return streamHandler.createStreamResponse(stream as any);
    } catch (error) {
      console.error('Error generating task description:', error);
      return streamHandler.createMockStreamResponse(
        `Error generating task description for: ${title}. Please try again later.`
      );
    }
  }
}

export const aiService = new AIService();
