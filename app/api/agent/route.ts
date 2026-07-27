import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";

// Same rationale as /api/chat: edge runtime for low latency. Web Crypto
// (crypto.subtle) used below for token hashing is available on edge.
export const runtime = "edge";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// A stronger model than the main chat's 8B default — code editing needs
// more reliable instruction-following. Override via env if Groq's
// catalog changes.
const AGENT_MODEL = process.env.GROQ_AGENT_MODEL ?? "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are a coding assistant embedded in a VS Code extension. You can see the user's open files and must respond with STRICT JSON ONLY — no prose outside the JSON, no markdown code fences.

Response shape (exact):
{
  "reply": "natural-language explanation of what you did or your answer",
  "edits": [
    {
      "path": "src/example.ts",
      "newFile": false,
      "hunks": [
        { "search": "exact existing text to locate (verbatim, including whitespace)", "replace": "replacement text" }
      ]
    }
  ]
}

Rules:
- "edits" is [] when no file change is needed — e.g. the user just asked a question.
- For an edit to an EXISTING file, each hunk's "search" must match the current file content EXACTLY (verbatim, including whitespace/indentation) so it can be located with a plain string search. Keep each "search" as short as possible while still being uniquely identifying within the file.
- For a NEW file, set "newFile": true and use a single hunk with "search": "" and the full file body in "replace".
- Never include prose, headers, or markdown fences outside the JSON object. The entire response must be valid JSON and nothing else.`;

const RETRY_INSTRUCTION =
  "Your previous response was not valid JSON. Respond again with ONLY the JSON object described in the system prompt — no prose, no markdown code fences, no explanation before or after it.";

type FileContext = { path: string; content: string };
type SelectionContext = { path: string; text: string };

type AgentRequestBody = {
  message: string;
  context?: {
    files?: FileContext[];
    selection?: SelectionContext;
  };
};

type AgentEdit = {
  path: string;
  newFile: boolean;
  hunks: { search: string; replace: string }[];
};

type AgentResult = {
  reply: string;
  edits: AgentEdit[];
};

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

function buildContextMessage(context: AgentRequestBody["context"]): string {
  const files = context?.files ?? [];
  const selection = context?.selection;

  const fileBlocks = files
    .map((f) => `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  const selectionBlock = selection
    ? `\n\nCurrent selection in ${selection.path}:\n\`\`\`\n${selection.text}\n\`\`\``
    : "";

  return `Open files:\n\n${fileBlocks || "(none)"}${selectionBlock}`;
}

async function callAgent(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: AGENT_MODEL,
    stream: false,
    messages,
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY is not set." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Missing token — set it in the extension's settings." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const tokenHash = await sha256Hex(token);
  const { data: userId, error: rpcError } = await supabase.rpc("verify_access_token", {
    p_hash: tokenHash,
  });
  if (rpcError || !userId) {
    return new Response(
      JSON.stringify({ error: "Invalid token — set a fresh one in the extension's settings." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: AgentRequestBody;
  try {
    body = await req.json();
    if (typeof body.message !== "string") throw new Error("message must be a string");
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildContextMessage(body.context) },
    { role: "user", content: body.message },
  ];

  try {
    let raw = await callAgent(messages);
    let result: AgentResult | null = null;

    try {
      result = JSON.parse(stripCodeFences(raw));
    } catch {
      raw = await callAgent([
        ...messages,
        { role: "assistant", content: raw },
        { role: "user", content: RETRY_INSTRUCTION },
      ]);
      try {
        result = JSON.parse(stripCodeFences(raw));
      } catch {
        result = { reply: raw, edits: [] };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("agent route error:", err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ error: "Failed to reach the model provider." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
