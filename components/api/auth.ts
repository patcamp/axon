import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type AuthSession = Session;

export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error?.message ?? null;
}

// Returns { needsConfirmation: true } when the Supabase project has
// "Confirm email" enabled — the user exists but has no session until
// they click the link in the confirmation email.
export async function signUp(
  email: string,
  password: string
): Promise<{ error: string | null; needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message, needsConfirmation: false };
  return { error: null, needsConfirmation: !data.session };
}

export async function signOut(): Promise<string | null> {
  const { error } = await supabase.auth.signOut();
  return error?.message ?? null;
}

export async function getSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Fires on sign-in, sign-out, and token refresh. Returns an
// unsubscribe function for useEffect cleanup.
export function onAuthChange(cb: (session: AuthSession | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
