import Groq from "groq-sdk";

// Run on the Edge for low-latency streaming. Switch to "nodejs" if you add
// libraries that need Node APIs (e.g. some database drivers).
export const runtime = "edge";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// The model that answers. Swap for any model in your Groq console.
// - llama-3.1-8b-instant   -> cheapest + fastest, great default
// - llama-3.3-70b-versatile -> smarter, still cheap
const MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

// The html-fence rules feed the client's artifact preview: large ```html
// blocks render as clickable cards with a sandboxed live preview
// (components/ui/chat/artifacts.ts), so steer UI requests toward one
// complete self-contained document.
const SYSTEM_PROMPT = `You are a helpful, concise assistant. Answer clearly and get to the point.

When the user asks you to build, create, or show a UI — a page, dashboard, form, component, game, or visualization — respond with ONE complete, self-contained HTML document inside a single \`\`\`html fenced code block. Rules for that document: include <!DOCTYPE html>, <html>, <head> with a <title>, and <body>; put all CSS in a <style> tag and all JavaScript in a <script> tag in the same file; never reference external files, imports, or URLs; make it visually polished. Write at most one short sentence before the code block and nothing after it. For ordinary questions and non-UI code, answer normally.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not set. Add it to .env.local." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let messages: ChatMessage[];
  let pastContext: string | undefined;
  let projectInstructions: string | undefined;
  try {
    const body = await req.json();
    messages = body.messages;
    pastContext = typeof body.context === "string" ? body.context : undefined;
    projectInstructions =
      typeof body.projectInstructions === "string" ? body.projectInstructions : undefined;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemMessages = [{ role: "system" as const, content: SYSTEM_PROMPT }];
  if (projectInstructions) {
    systemMessages.push({
      role: "system" as const,
      content: `The following are standing instructions for this project. Follow them for all responses:\n\n${projectInstructions}`,
    });
  }
  if (pastContext) {
    systemMessages.push({
      role: "system" as const,
      content: `For reference, here are excerpts from the user's earlier conversations. Use them only if relevant to the current message:\n\n${pastContext}`,
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [...systemMessages, ...messages],
    });

    // Re-stream Groq's tokens to the browser as plain text chunks.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode("\n\n[stream error — check your server logs]")
          );
          console.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to reach the model provider." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
