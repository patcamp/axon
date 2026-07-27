import * as vscode from "vscode";
import * as Diff from "diff";
import { callAgent, AgentAuthError, AgentNetworkError } from "./agentClient";
import { gatherContext } from "./context";
import { applyEdits } from "./applyEdits";
import { Changelog, ChangelogEntry } from "./changelog";

function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "out", "webview", "main.js")
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "out", "webview", "styles.css")
  );
  const nonce = Math.random().toString(36).slice(2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${styleUri}" />
  <title>Axon Assistant</title>
</head>
<body>
  <div id="thread"></div>
  <div id="composer">
    <textarea id="input" placeholder="Ask Axon…" rows="2"></textarea>
    <button id="send">Send</button>
  </div>
  <h2>Changelog</h2>
  <div id="changelog"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function serializeEntry(entry: ChangelogEntry) {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    request: entry.request,
    undone: entry.undone,
    files: entry.files.map((f) => ({
      path: f.path,
      applied: f.applied,
      note: f.note,
      diff: Diff.diffLines(f.before, f.after),
    })),
  };
}

export class AxonPanel {
  public static current: AxonPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly changelog = new Changelog();
  private readonly disposables: vscode.Disposable[] = [];

  static createOrShow(extensionUri: vscode.Uri) {
    if (AxonPanel.current) {
      AxonPanel.current.panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "axonAssistant",
      "Axon Assistant",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "out")],
      }
    );
    AxonPanel.current = new AxonPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.panel.webview.html = getWebviewHtml(this.panel.webview, extensionUri);

    this.panel.webview.onDidReceiveMessage(
      (message) => this.handleMessage(message),
      null,
      this.disposables
    );
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  private async handleMessage(message: { type: string; text?: string; entryId?: string }) {
    if (message.type === "send" && message.text) {
      await this.handleSend(message.text);
    } else if (message.type === "undo" && message.entryId) {
      await this.handleUndo(message.entryId);
    }
  }

  private async handleSend(text: string) {
    const config = vscode.workspace.getConfiguration("axon");
    const backendUrl = config.get<string>("backendUrl", "");
    const token = config.get<string>("token", "");

    try {
      const context = gatherContext();
      const result = await callAgent(backendUrl, token, text, context);
      this.panel.webview.postMessage({ type: "reply", reply: result.reply });

      if (result.edits.length > 0) {
        const files = await applyEdits(result.edits);
        this.changelog.add(text, files);
        this.postChangelog();
      }
    } catch (err) {
      this.handleError(err);
    }
  }

  private async handleUndo(entryId: string) {
    try {
      await this.changelog.undo(entryId);
      this.postChangelog();
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(err: unknown) {
    const message =
      err instanceof AgentAuthError || err instanceof AgentNetworkError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong.";
    vscode.window.showErrorMessage(message);
    this.panel.webview.postMessage({ type: "error", message });
  }

  private postChangelog() {
    this.panel.webview.postMessage({
      type: "changelog",
      entries: this.changelog.all().map(serializeEntry),
    });
  }

  private dispose() {
    AxonPanel.current = undefined;
    this.disposables.forEach((d) => d.dispose());
  }
}
