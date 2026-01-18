import type { ChatMessageForAPI } from "../types";

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

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) params.onToken(chunk);
  }

  return { conversationId: newConversationId };
}
