"use client";

import type { ChatMessage } from "../types";
import { AssistantMeta } from "./AssistantMeta";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <div key={m.id}>
          <MessageBubble role={m.role} content={m.content} />
          {m.role === "assistant" && (
            <AssistantMeta
              selectedModel={m.selectedModel}
              queryRouting={m.queryRouting}
            />
          )}
        </div>
      ))}
    </div>
  );
}
