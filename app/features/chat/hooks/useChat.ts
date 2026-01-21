"use client";

import { useMemo, useRef, useState } from "react";

import { QueryRouting } from "@/lib/streaming/types";
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

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading],
  );

  const stop = () => abortRef.current?.abort();

  const pendingAssistantIdRef = useRef<string | null>(null);

  const appendToLastAssistant = (chunk: string) => {
    const id = pendingAssistantIdRef.current;
    if (!id) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    );
  };

  const setLastAssistantRouting = (qr: QueryRouting) => {
    const id = pendingAssistantIdRef.current;
    if (!id) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, selectedModel: qr.selected_model, queryRouting: qr }
          : m,
      ),
    );
  };

  const setLastAssistantError = (message: string) => {
    const id = pendingAssistantIdRef.current;
    if (!id) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content: `에러: ${message}` } : m,
      ),
    );
  };

  const [conversationId, setConversationId] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };

    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    };
    pendingAssistantIdRef.current = assistantId;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { conversationId: newConversationId } = await streamChat({
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ],
        conversationId: conversationId ?? undefined,
        signal: controller.signal,
        onToken: appendToLastAssistant,
        onQueryRouting: setLastAssistantRouting,
      });

      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
      }
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
      pendingAssistantIdRef.current = null;
    }
  };

  return { messages, input, setInput, loading, canSend, send, stop };
}
