import * as vscode from "vscode";
import { randomUUID } from "crypto";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoredSession extends SessionMeta {
  messages: ChatMessage[];
}

const STORAGE_KEY = "axon.sessions";

// Persisted via globalState (not workspace-scoped) — a session belongs to
// your Axon account/conversation, not a specific folder. Only chat text
// persists across restarts; changelog/undo state stays in-memory per open
// panel (see panel.ts), same tradeoff as Phase 2.
export class SessionStore {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();
  readonly onDidChange = this.onDidChangeEmitter.event;

  constructor(private readonly context: vscode.ExtensionContext) {}

  private readAll(): StoredSession[] {
    return this.context.globalState.get<StoredSession[]>(STORAGE_KEY, []);
  }

  private async writeAll(sessions: StoredSession[]): Promise<void> {
    await this.context.globalState.update(STORAGE_KEY, sessions);
    this.onDidChangeEmitter.fire();
  }

  list(): SessionMeta[] {
    return this.readAll()
      .map(({ id, title, createdAt, updatedAt }) => ({ id, title, createdAt, updatedAt }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  get(id: string): StoredSession | undefined {
    return this.readAll().find((s) => s.id === id);
  }

  async create(): Promise<StoredSession> {
    const now = Date.now();
    const session: StoredSession = {
      id: randomUUID(),
      title: "New chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    await this.writeAll([session, ...this.readAll()]);
    return session;
  }

  async appendMessage(id: string, message: ChatMessage): Promise<void> {
    const sessions = this.readAll();
    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    session.messages.push(message);
    session.updatedAt = Date.now();
    if (session.title === "New chat" && message.role === "user") {
      session.title = message.content.slice(0, 60);
    }
    await this.writeAll(sessions);
  }

  async delete(id: string): Promise<void> {
    await this.writeAll(this.readAll().filter((s) => s.id !== id));
  }
}
