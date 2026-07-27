export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  project_id: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  instructions_md: string;
  is_builtin: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}
