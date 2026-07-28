import Groq from "groq-sdk";

// Run on the Edge for low-latency responses. Switch to "nodejs" if you add
// libraries that need Node APIs (e.g. some database drivers).
export const runtime = "edge";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

const SYSTEM_PROMPT =
  "You write short titles for chat conversations. Given the first exchange, " +
  "reply with ONLY a concise title (max 6 words, no quotes, no punctuation " +
  "at the end) that captures what the conversation is about.";

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not set. Add it to .env.local." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let userMessage: string;
  let assistantMessage: string;
  try {
    const body = await req.json();
    userMessage = typeof body.userMessage === "string" ? body.userMessage : "";
    assistantMessage = typeof body.assistantMessage === "string" ? body.assistantMessage : "";
    if (!userMessage) throw new Error("userMessage is required");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      stream: false,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `User: ${userMessage.slice(0, 500)}\n\nAssistant: ${assistantMessage.slice(0, 500)}`,
        },
      ],
    });

    const title = completion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") ?? "";

    return new Response(JSON.stringify({ title }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to reach the model provider." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
