import { GatheredContext } from "./context";

export interface AgentEdit {
  path: string;
  newFile: boolean;
  hunks: { search: string; replace: string }[];
}

export interface AgentResult {
  reply: string;
  edits: AgentEdit[];
}

export class AgentAuthError extends Error {}
export class AgentNetworkError extends Error {}

export async function callAgent(
  backendUrl: string,
  token: string,
  message: string,
  context: GatheredContext
): Promise<AgentResult> {
  if (!backendUrl || !token) {
    throw new AgentAuthError(
      "Set axon.backendUrl and axon.token in Settings before using the assistant."
    );
  }

  let res: Response;
  try {
    res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, context }),
    });
  } catch {
    throw new AgentNetworkError(
      `Could not reach ${backendUrl}. Check your network connection and the axon.backendUrl setting.`
    );
  }

  if (res.status === 401) {
    throw new AgentAuthError("Invalid or missing token — set a fresh one in Axon settings.");
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body?.error === "string" ? body.error : "";
    } catch {
      // response wasn't JSON — fall through to generic message
    }
    throw new AgentNetworkError(detail || `Request failed (${res.status}).`);
  }

  return (await res.json()) as AgentResult;
}
