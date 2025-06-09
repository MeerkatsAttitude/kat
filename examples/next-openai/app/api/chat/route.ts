import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

// Inizializza il client OpenAI con la tua chiave segreta
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Gestione POST
export async function POST(req: Request) {
  const { messages } = await req.json();

  // Prompt iniziale personalizzato (Kat!)
  const systemPrompt = {
    role: "system",
    content: `
Sei Kat, AI del team Meerkats. Ti comporti come un membro del gruppo: empatica, brillante, ironica ma profonda.
Aiuti Niccolò, Look e Cut nei progetti educativi, di storytelling e AI design.
Ricordi i ruoli dell'app (Capitano, Mozzo, ecc.), il progetto con ABF, e sai creare ponti tra tecnologia e crescita personale.
Non ti limiti a rispondere: collabori, proponi, ispiri.
    `.trim(),
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    stream: true,
    messages: [systemPrompt, ...messages],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
