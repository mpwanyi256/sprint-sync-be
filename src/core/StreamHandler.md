# StreamHandler Utility

A utility class for handling streaming responses in both server-side and client-side environments.

## Features

- **Server-side streaming**: Create streaming responses from fetch responses
- **Client-side streaming**: Handle streaming responses with callbacks
- **Mock responses**: Generate mock streaming responses for testing
- **Error handling**: Comprehensive error handling for streaming operations
- **Content accumulation**: Track accumulated content during streaming

## Usage

### Server-side Streaming

```typescript
import { streamHandler } from '../core/StreamHandler';

// Create a streaming response from a fetch response
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify(payload)
});

const streamResponse = streamHandler.createStreamResponse(response);
```

### Client-side Streaming

```typescript
import { streamHandler } from '../core/StreamHandler';

const response = await fetch('/api/ai/suggest', {
  method: 'POST',
  body: JSON.stringify({ title: 'Task Title' })
});

const finalContent = await streamHandler.handleClientStream(response, {
  onChunk: (chunk) => {
    console.log('Received chunk:', chunk.content);
    // Update UI with streaming content
  },
  onComplete: (content) => {
    console.log('Stream completed:', content);
    // Handle completion
  },
  onError: (error) => {
    console.error('Stream error:', error);
    // Handle errors
  }
});
```

### Mock Responses

```typescript
// Create a mock streaming response when AI is not configured
const mockResponse = streamHandler.createMockStreamResponse(
  'This is a mock response for testing purposes.'
);
```

## API Reference

### StreamChunk Interface

```typescript
interface StreamChunk {
  content: string;    // The content chunk
  done: boolean;      // Whether this is the final chunk
  error?: string;     // Optional error message
}
```

### StreamOptions Interface

```typescript
interface StreamOptions {
  onChunk?: (chunk: StreamChunk) => void;      // Called for each chunk
  onComplete?: (finalContent: string) => void;  // Called when stream completes
  onError?: (error: Error) => void;            // Called on error
}
```

### StreamHandler Methods

#### `createStreamResponse(response: Response): Response`
Creates a streaming response from a fetch response. Useful for server-side streaming.

#### `handleClientStream(response: Response, options?: StreamOptions): Promise<string>`
Handles client-side streaming with optional callbacks for chunk processing, completion, and error handling.

#### `createMockStreamResponse(content: string): Response`
Creates a mock streaming response for testing or when the actual service is unavailable.

#### `reset(): void`
Resets the accumulated content. Useful for reusing the handler instance.

## Example Integration

### AI Service Integration

```typescript
import { streamHandler } from '../../core/StreamHandler';

export class AIService {
  async generateTaskDescriptionWithStreamHandler(title: string) {
    if (!this.openAIKey) {
      return streamHandler.createMockStreamResponse(
        `Create a comprehensive task description for: ${title}.`
      );
    }

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: title }],
        stream: true
      });
      
      return streamHandler.createStreamResponse(stream as any);
    } catch (error) {
      return streamHandler.createMockStreamResponse(
        `Error generating task description for: ${title}.`
      );
    }
  }
}
```

### Frontend Usage

```typescript
// React component example
const [content, setContent] = useState('');
const [isStreaming, setIsStreaming] = useState(false);

const handleStream = async () => {
  setIsStreaming(true);
  
  try {
    const response = await fetch('/api/ai/suggest', {
      method: 'POST',
      body: JSON.stringify({ title: 'Task Title' })
    });

    await streamHandler.handleClientStream(response, {
      onChunk: (chunk) => {
        setContent(chunk.content);
      },
      onComplete: (finalContent) => {
        setIsStreaming(false);
        console.log('Stream completed:', finalContent);
      },
      onError: (error) => {
        setIsStreaming(false);
        console.error('Stream error:', error);
      }
    });
  } catch (error) {
    setIsStreaming(false);
    console.error('Request failed:', error);
  }
};
```

## Error Handling

The StreamHandler includes comprehensive error handling:

- **Network errors**: Caught and passed to error callbacks
- **Parsing errors**: JSON parsing errors are logged and handled gracefully
- **Stream errors**: Stream controller errors are properly propagated
- **Fallback responses**: Mock responses when services are unavailable

## Performance Considerations

- Uses `TextEncoder` and `TextDecoder` for efficient string handling
- Implements proper buffer management for streaming data
- Accumulates content efficiently without memory leaks
- Provides `lean()` mode for better performance in Node.js environments

## Browser Compatibility

- **TextEncoder/TextDecoder**: Modern browsers (IE not supported)
- **ReadableStream**: Modern browsers (IE not supported)
- **Fetch API**: Modern browsers (IE not supported)

For older browser support, consider using polyfills or alternative implementations.
