import { FileChange, revertFileChanges } from "./applyEdits";

export interface ChangelogEntry {
  id: string;
  timestamp: number;
  request: string;
  files: FileChange[];
  undone: boolean;
}

// In-memory only — per session, not persisted across VS Code restarts.
export class Changelog {
  private entries: ChangelogEntry[] = [];

  add(request: string, files: FileChange[]): ChangelogEntry {
    const entry: ChangelogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      request,
      files,
      undone: false,
    };
    this.entries.unshift(entry);
    return entry;
  }

  all(): ChangelogEntry[] {
    return this.entries;
  }

  async undo(id: string): Promise<ChangelogEntry | undefined> {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry || entry.undone) return entry;
    await revertFileChanges(entry.files.filter((f) => f.applied));
    entry.undone = true;
    return entry;
  }
}
