"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { streamChat } from "../api/streamChat";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid(), role: "assistant", content: "안녕! 무엇을 도와줄까?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const stop = () => abortRef.current?.abort();

  const pushUserAndPlaceholder = (text: string) => {
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    const assistant: ChatMessage = { id: uid(), role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, assistant]);
  };

  const appendToLastAssistant = (chunk: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant") return prev;
      const copy = [...prev];
      copy[copy.length - 1] = { ...last, content: last.content + chunk };
      return copy;
    });
  };

  const setLastAssistantError = (message: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last.content === "") {
        const copy = [...prev];
        copy[copy.length - 1] = { ...last, content: `에러: ${message}` };
        return copy;
      }
      return [...prev, { id: uid(), role: "assistant", content: `에러: ${message}` }];
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    pushUserAndPlaceholder(text);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ],
        signal: controller.signal,
        onToken: appendToLastAssistant,
      });
    } catch (e: unknown) {
      const message =
        e instanceof DOMException && e.name === "AbortError"
          ? "요청이 취소됐습니다."
          : e instanceof Error
            ? e.message
            : "Unknown error";

      setLastAssistantError(message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return { messages, input, setInput, loading, canSend, send, stop };
}
