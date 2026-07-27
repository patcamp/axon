import * as vscode from "vscode";
import { AgentEdit } from "./agentClient";

export interface FileChange {
  path: string;
  before: string;
  after: string;
  applied: boolean;
  isNewFile: boolean;
  note?: string;
}

function resolveUri(relativePath: string): vscode.Uri {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) throw new Error("No workspace folder is open.");
  return vscode.Uri.joinPath(folder.uri, relativePath);
}

async function readFileText(uri: vscode.Uri): Promise<string> {
  try {
    const doc = await vscode.workspace.openTextDocument(uri);
    return doc.getText();
  } catch {
    return "";
  }
}

function fullRange(doc: vscode.TextDocument): vscode.Range {
  return new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
}

// Applies every hunk for a file against an in-memory copy of its text
// (sequential find/replace, skipping + noting any hunk whose `search`
// isn't found), then issues one WorkspaceEdit per file, batched into a
// single applyEdit call for the whole turn.
export async function applyEdits(edits: AgentEdit[]): Promise<FileChange[]> {
  if (edits.length === 0) return [];

  const workspaceEdit = new vscode.WorkspaceEdit();
  const changes: FileChange[] = [];
  const toSave: vscode.Uri[] = [];

  for (const edit of edits) {
    const uri = resolveUri(edit.path);

    if (edit.newFile) {
      const content = edit.hunks[0]?.replace ?? "";
      workspaceEdit.createFile(uri, { overwrite: true, contents: Buffer.from(content, "utf8") });
      changes.push({ path: edit.path, before: "", after: content, applied: true, isNewFile: true });
      toSave.push(uri);
      continue;
    }

    const before = await readFileText(uri);
    let working = before;
    let allApplied = true;
    const notes: string[] = [];

    for (const hunk of edit.hunks) {
      if (!working.includes(hunk.search)) {
        allApplied = false;
        notes.push(`Could not apply one change to ${edit.path} — the target text wasn't found.`);
        continue;
      }
      working = working.replace(hunk.search, hunk.replace);
    }

    if (working !== before) {
      const doc = await vscode.workspace.openTextDocument(uri);
      workspaceEdit.replace(uri, fullRange(doc), working);
      toSave.push(uri);
    }

    changes.push({
      path: edit.path,
      before,
      after: working,
      applied: allApplied,
      isNewFile: false,
      note: notes.length > 0 ? notes.join(" ") : undefined,
    });
  }

  await vscode.workspace.applyEdit(workspaceEdit);
  for (const uri of toSave) {
    const doc = await vscode.workspace.openTextDocument(uri);
    await doc.save();
  }

  return changes;
}

// Reverts a set of previously-applied file changes: deletes files that
// were newly created, restores the prior text for edited ones.
export async function revertFileChanges(changes: FileChange[]): Promise<void> {
  const workspaceEdit = new vscode.WorkspaceEdit();

  for (const change of changes) {
    const uri = resolveUri(change.path);
    if (change.isNewFile) {
      workspaceEdit.deleteFile(uri, { ignoreIfNotExists: true });
      continue;
    }
    const doc = await vscode.workspace.openTextDocument(uri);
    workspaceEdit.replace(uri, fullRange(doc), change.before);
  }

  await vscode.workspace.applyEdit(workspaceEdit);

  for (const change of changes) {
    if (change.isNewFile) continue;
    const uri = resolveUri(change.path);
    const doc = await vscode.workspace.openTextDocument(uri);
    await doc.save();
  }
}
