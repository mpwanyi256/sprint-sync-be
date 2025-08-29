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

  async generateTaskDescription(title: string) {
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    return this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates clear, concise task descriptions. Return only the task description without any formatting, bullet points, or special characters. Keep it professional and actionable. Include specific steps or requirements if needed.'
        },
        {
          role: 'user',
          content: `Generate a task description for: ${title}`
        }
      ],
      stream: true,
      max_tokens: 300,
      temperature: 0.7,
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
