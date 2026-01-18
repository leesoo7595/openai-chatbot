"use client";

import type { ChatMessage } from "../types";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} />
      ))}
    </div>
  );
}
