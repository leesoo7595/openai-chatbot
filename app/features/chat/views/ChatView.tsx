"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage, ChatMessageForAPI } from "../types";
import { streamChat } from "../api/streamChat";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", content: "안녕! 뭐 도와줄까?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const canSend = useMemo(() => input.trim() && !loading, [input, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const apiMessages: ChatMessageForAPI[] = [
      // (원하면) 시스템 프롬프트 넣는 자리
      // { role: "system", content: "너는 친절한 챗봇이야." },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        messages: apiMessages,
        signal: controller.signal,
        onToken: (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: last.content + chunk };
            }
            return copy;
          });
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          copy[copy.length - 1] = { ...last, content: `에러: ${msg}` };
          return copy;
        }
        return [...copy, { id: uid(), role: "assistant", content: `에러: ${msg}` }];
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">Chat</h1>
            <p className="text-xs text-zinc-400">
              {loading ? "생성 중..." : "질문을 입력해봐"}
            </p>
          </div>

          {loading ? (
            <button
              onClick={stop}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
            >
              중지
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} content={m.content} />
          ))}
        </div>
      </div>

      <footer className="sticky bottom-0 border-t border-white/10 bg-zinc-950/80 px-4 py-4 backdrop-blur">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            disabled={loading}
            placeholder="메시지를 입력하세요..."
            className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-white/10"
          />

          <button
            onClick={send}
            disabled={!canSend}
            className="h-12 rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-900 disabled:opacity-40"
          >
            보내기
          </button>
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">Enter 전송 · Shift+Enter 줄바꿈</p>
      </footer>
    </div>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-white text-zinc-900" : "border border-white/10 bg-white/5 text-zinc-100",
        ].join(" ")}
      >
        {content || (role === "assistant" ? "…" : "")}
      </div>
    </div>
  );
}
