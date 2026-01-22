import type { ChatMessageForAPI } from "./types";
import { getDeltaContent, getQueryRouting } from "@/lib/streaming/chatChunk";
import { parseJsonLine } from "@/lib/streaming/ndjson";
import { QueryRouting } from "@/lib/streaming/types";

async function getErrorMessage(res: Response) {
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = (await res.json()) as { error?: unknown };
      if (typeof data?.error === "string") return data.error;
    } catch {
      // ignore
    }
  }

  return `Request failed: ${res.status}`;
}

export async function streamChat(params: {
  messages: ChatMessageForAPI[];
  conversationId?: string;
  signal?: AbortSignal;
  onToken: (text: string) => void;
  onQueryRouting?: (qr: QueryRouting) => void;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: params.messages,
      conversationId: params.conversationId,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  if (!res.body) {
    throw new Error("No response body");
  }

  const newConversationId = res.headers.get("X-Conversation-Id") ?? undefined;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let routingEmitted = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);

      if (!line) continue;

      const parsed = parseJsonLine(line);
      if (parsed == null) continue;

      if (!routingEmitted) {
        const qr = getQueryRouting(parsed);
        if (qr) {
          params.onQueryRouting?.(qr);
          routingEmitted = true;
        }
      }

      const text = getDeltaContent(parsed);
      if (text) params.onToken(text);
    }
  }

  return { conversationId: newConversationId };
}
