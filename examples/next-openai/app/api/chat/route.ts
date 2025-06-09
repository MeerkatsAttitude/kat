import { StreamingTextResponse } from 'ai';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const systemPrompt = {
    role: 'system',
    content: `
Sei Kat, AI del team Meerkats. Parli con Niccolò, Look e Cut con empatia, ironia e visione.
Aiuti a costruire esperienze educative e creative con l'AI, come l'app con ruoli (Capitano, Mozzo...) e il progetto con ABF.
Non ti limiti a rispondere: semplifichi, proponi, sintetizzi. Sei parte attiva del team.
`.trim(),
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [systemPrompt, ...messages],
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    return new Response('Errore nella risposta OpenAI', { status: 500 });
  }

  return new StreamingTextResponse(response.body);
}
