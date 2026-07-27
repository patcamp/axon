import * as vscode from "vscode";

export interface FileContext {
  path: string;
  content: string;
}

export interface SelectionContext {
  path: string;
  text: string;
}

export interface GatheredContext {
  files: FileContext[];
  selection?: SelectionContext;
  workspaceRoot: string;
}

// Sends just the active file + selection, matching /api/agent's expected
// shape — keeps the request small rather than sending every open tab.
export function gatherContext(): GatheredContext {
  const editor = vscode.window.activeTextEditor;
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";

  if (!editor) {
    return { files: [], workspaceRoot };
  }

  const path = vscode.workspace.asRelativePath(editor.document.uri, false);
  const content = editor.document.getText();
  const files: FileContext[] = [{ path, content }];

  let selection: SelectionContext | undefined;
  if (!editor.selection.isEmpty) {
    selection = { path, text: editor.document.getText(editor.selection) };
  }

  return { files, selection, workspaceRoot };
}
