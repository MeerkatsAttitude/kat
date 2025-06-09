import { ReadableStream } from 'web-streams-polyfill/ponyfill';
export const runtime = 'edge';

function eventSourceTransform(stream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async pull(controller) {
      const reader = stream.getReader();
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';
      for (const part of parts) {
        if (part.startsWith('data:')) {
          const message = part.replace(/^data:\s*/, '');
          if (message === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(message);
            const text = json.choices[0].delta?.content || '';
            controller.enqueue(encoder.encode(text));
          } catch (e) { }
        }
      }
    }
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const systemPrompt = {
    role: 'system',
    content: `Sei Kat, AI del team Meerkats… (il prompt che hai definito)`,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [systemPrompt, ...messages],
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const err = await response.text();
    return new Response(`Errore OpenAI: ${response.status} - ${err}`, { status: 500 });
  }

  const transformed = eventSourceTransform(response.body);
  return new Response(transformed, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
