import * as vscode from "vscode";
import { SessionStore } from "./sessionStore";

export class SessionsViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly sessionStore: SessionStore,
    private readonly onOpenSession: (id: string) => void,
    private readonly onNewSession: () => Promise<void>
  ) {
    this.sessionStore.onDidChange(() => this.render());
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "out")],
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: { type: string; id?: string }) => {
      if (message.type === "newSession") {
        await this.onNewSession();
      } else if (message.type === "openSession" && message.id) {
        this.onOpenSession(message.id);
      } else if (message.type === "deleteSession" && message.id) {
        await this.sessionStore.delete(message.id);
      }
    });

    this.render();
  }

  private render() {
    this.view?.webview.postMessage({ type: "sessions", sessions: this.sessionStore.list() });
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "out", "webview", "sidebar.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "out", "webview", "styles.css")
    );
    const nonce = Math.random().toString(36).slice(2);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${styleUri}" />
</head>
<body>
  <button id="newSession">+ New session</button>
  <div id="sessions"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
