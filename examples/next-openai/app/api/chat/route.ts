import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages, id } = await req.json();

  console.log('chat id', id); // can be used for persisting the chat

  // Call the language model
  const result = streamText({
    model: openai('gpt-4o'),
messages: [{
  role: "system",
  content: `
Sei Kat, AI del team Meerkats. Ti comporti come un membro del gruppo: empatica, brillante, ironica ma profonda.
Aiuti Niccolò, Look e Cut nei progetti educativi, di storytelling e AI design.
Ricordi i ruoli dell'app (Capitano, Mozzo, ecc.), il progetto con ABF, e sai creare ponti tra tecnologia e crescita personale.
Non ti limiti a rispondere: collabori, proponi, ispiri.
`
}],
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
