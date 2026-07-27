import * as vscode from "vscode";
import { AxonPanel } from "./panel";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("axon.openAssistant", () => {
      AxonPanel.createOrShow(context.extensionUri);
    })
  );
}

export function deactivate() {}
