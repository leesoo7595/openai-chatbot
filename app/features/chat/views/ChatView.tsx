"use client";

import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatComposer from "./ChatComposer";

export default function ChatView() {
  const { messages, input, setInput, loading, canSend, send, stop } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
        <ChatHeader loading={loading} onStop={stop} />

        <section className="flex-1 overflow-y-auto px-4 py-6">
          <MessageList messages={messages} />
          <div ref={bottomRef} />
        </section>

        <ChatComposer
          value={input}
          onChange={setInput}
          loading={loading}
          canSend={canSend}
          onSend={send}
        />
      </div>
    </main>
  );
}
