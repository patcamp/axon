import { supabase } from "@/lib/supabase";
import { ThemeMode, UserSettings } from "@/lib/types";

export const DEFAULT_THEME: ThemeMode = "dark";
export const DEFAULT_ACCENT = "#7C5CFF";

// Curated accent swatches from the design spec (violet is default).
export const ACCENT_SWATCHES = [
  "#7C5CFF", "#3B82F6", "#10B981", "#F59E0B", "#EC4899",
  "#EF4444", "#06B6D4", "#6366F1", "#84CC16", "#14B8A6",
];

export async function getSettings(): Promise<UserSettings | null> {
  const { data } = await supabase.from("user_settings").select("*").maybeSingle();
  return (data as UserSettings | null) ?? null;
}

export async function saveSettings(
  theme: ThemeMode,
  accentColor: string
): Promise<string | null> {
  const { error } = await supabase
    .from("user_settings")
    .upsert({ theme, accent_color: accentColor }, { onConflict: "user_id" });
  return error?.message ?? null;
}
