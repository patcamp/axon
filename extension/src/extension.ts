import * as vscode from "vscode";
import { AxonPanel } from "./panel";
import { SessionStore } from "./sessionStore";
import { SessionsViewProvider } from "./sessionsView";

export function activate(context: vscode.ExtensionContext) {
  const sessionStore = new SessionStore(context);

  async function startNewSession() {
    const session = await sessionStore.create();
    AxonPanel.open(context.extensionUri, sessionStore, session.id);
  }

  const sessionsViewProvider = new SessionsViewProvider(
    context.extensionUri,
    sessionStore,
    (id) => AxonPanel.open(context.extensionUri, sessionStore, id),
    startNewSession
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("axon.sessionsView", sessionsViewProvider),
    vscode.commands.registerCommand("axon.openAssistant", startNewSession)
  );
}

export function deactivate() {}
