import { supabase } from "@/lib/supabase";
import { Message } from "@/lib/types";

export async function listMessages(
  conversationId: string
): Promise<{ data: Message[]; error: string | null }> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return { data: (data as Message[] | null) ?? [], error: error?.message ?? null };
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<string | null> {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content });
  return error?.message ?? null;
}

const MAX_PAST_CONVERSATIONS = 5;
const MAX_MESSAGES_PER_CONVERSATION = 8;
const MAX_MESSAGE_CHARS = 500;

type PastRow = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  conversation_id: string;
  conversations: { title: string } | null;
};

// Builds a condensed transcript of the user's other conversations, for
// grounding a brand-new chat. Capped on all axes (conversations,
// messages per conversation, chars per message) to keep the extra
// tokens sent to Groq bounded regardless of how much history exists.
export async function getPastContext(excludeConversationId: string): Promise<string> {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content, created_at, conversation_id, conversations(title)")
    .neq("conversation_id", excludeConversationId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data || data.length === 0) return "";

  const byConversation = new Map<string, { title: string; rows: PastRow[] }>();
  for (const row of data as unknown as PastRow[]) {
    const existing = byConversation.get(row.conversation_id);
    if (existing) {
      if (existing.rows.length < MAX_MESSAGES_PER_CONVERSATION) existing.rows.push(row);
    } else if (byConversation.size < MAX_PAST_CONVERSATIONS) {
      byConversation.set(row.conversation_id, {
        title: row.conversations?.title ?? "Untitled chat",
        rows: [row],
      });
    }
  }

  const blocks: string[] = [];
  for (const { title, rows } of Array.from(byConversation.values())) {
    const chronological = [...rows].reverse();
    const lines = chronological.map(
      (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, MAX_MESSAGE_CHARS)}`
    );
    blocks.push(`### ${title}\n${lines.join("\n")}`);
  }

  return blocks.join("\n\n");
}
