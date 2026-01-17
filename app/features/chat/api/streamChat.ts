import type { ChatMessageForAPI } from "../types";

export async function streamChat(params: {
  messages: ChatMessageForAPI[];
  signal?: AbortSignal;
  onToken: (text: string) => void;
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: params.messages }),
    signal: params.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) params.onToken(chunk);
  }
}
