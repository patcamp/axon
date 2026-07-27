import { supabase } from "@/lib/supabase";
import { AccessToken } from "@/lib/types";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  Array.from(bytes).forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
}

// Generates a random token client-side, stores only its SHA-256 hash, and
// returns the plaintext once — it is never persisted or retrievable again.
export async function generateAndStoreToken(
  name: string = "VS Code extension"
): Promise<{ token: string | null; error: string | null }> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToBase64Url(randomBytes);
  const token_hash = await sha256Hex(token);

  const { error } = await supabase.from("access_tokens").insert({ token_hash, name });
  if (error) return { token: null, error: error.message };
  return { token, error: null };
}

export async function listTokens(): Promise<{ data: AccessToken[]; error: string | null }> {
  const { data, error } = await supabase
    .from("access_tokens")
    .select("id, user_id, name, created_at, last_used_at")
    .order("created_at", { ascending: false });
  return { data: (data as AccessToken[] | null) ?? [], error: error?.message ?? null };
}

export async function deleteToken(id: string): Promise<string | null> {
  const { error } = await supabase.from("access_tokens").delete().eq("id", id);
  return error?.message ?? null;
}
