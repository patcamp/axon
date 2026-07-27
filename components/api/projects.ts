import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";

export async function listProjects(): Promise<{ data: Project[]; error: string | null }> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: (data as Project[] | null) ?? [], error: error?.message ?? null };
}

export async function createProject(
  name: string,
  instructions_md: string,
  is_builtin: boolean = false
): Promise<{ data: Project | null; error: string | null }> {
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, instructions_md, is_builtin })
    .select()
    .single();
  return { data: (data as Project | null) ?? null, error: error?.message ?? null };
}

export async function deleteProject(id: string): Promise<string | null> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return error?.message ?? null;
}

const BUDGET_PROJECT_INSTRUCTIONS =
  "You are a personal budget assistant. Below is the user's live pay-period data. " +
  "Answer questions about their spending, remaining budget per category, and paycheck " +
  "breakdown using it. You cannot make changes to their budget — if asked to log an " +
  "expense or edit something, tell them to do it in the budget app.";

// Creates the built-in "Budget" project on first load if the user doesn't
// have one yet. Safe to call every mount — the partial unique index on
// (user_id) where is_builtin prevents duplicates under a race.
export async function ensureBudgetProject(
  existingProjects: Project[]
): Promise<Project | null> {
  const existing = existingProjects.find((p) => p.is_builtin);
  if (existing) return existing;

  const { data } = await createProject("Budget", BUDGET_PROJECT_INSTRUCTIONS, true);
  return data;
}
