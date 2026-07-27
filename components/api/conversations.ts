import { supabase } from "@/lib/supabase";
import { Conversation } from "@/lib/types";

export async function listConversations(): Promise<{
  data: Conversation[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: (data as Conversation[] | null) ?? [], error: error?.message ?? null };
}

export async function createConversation(
  title: string = "New chat",
  projectId: string | null = null
): Promise<{ data: Conversation | null; error: string | null }> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ title, project_id: projectId })
    .select()
    .single();
  return { data: (data as Conversation | null) ?? null, error: error?.message ?? null };
}

export async function deleteConversation(id: string): Promise<string | null> {
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  return error?.message ?? null;
}

export async function renameConversation(id: string, title: string): Promise<string | null> {
  const { error } = await supabase.from("conversations").update({ title }).eq("id", id);
  return error?.message ?? null;
}

export async function setConversationFavorite(
  id: string,
  isFavorite: boolean
): Promise<string | null> {
  const { error } = await supabase
    .from("conversations")
    .update({ is_favorite: isFavorite })
    .eq("id", id);
  return error?.message ?? null;
}

export async function setConversationProject(
  id: string,
  projectId: string | null
): Promise<string | null> {
  const { error } = await supabase
    .from("conversations")
    .update({ project_id: projectId })
    .eq("id", id);
  return error?.message ?? null;
}
