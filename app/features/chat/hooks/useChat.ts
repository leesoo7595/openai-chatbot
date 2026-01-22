"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { QueryRouting } from "@/lib/streaming/types";
import type { ChatMessage } from "../types";
import { useStreamChatMutation } from "./useStreamChatMutation";

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const messagesKey = (id: string) => ["conversations", id, "messages"] as const;
type MessagesKey = ReturnType<typeof messagesKey>;

export function useChat({ conversationId }: { conversationId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const tempIdRef = useRef<string | null>(null);

  const streamMutation = useStreamChatMutation();
  const loading = streamMutation.isPending;

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const stop = () => abortRef.current?.abort();

  const appendToAssistant = (k: MessagesKey, assistantId: string) => (chunk: string) => {
    qc.setQueryData<ChatMessage[]>(k, (prev = []) =>
      prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
    );
  };

  const setAssistantRouting = (k: MessagesKey, assistantId: string) => (qr: QueryRouting) => {
    qc.setQueryData<ChatMessage[]>(k, (prev = []) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, selectedModel: qr.selected_model, queryRouting: qr } : m,
      ),
    );
  };

  const setAssistantError = (k: MessagesKey, assistantId: string, message: string) => {
    qc.setQueryData<ChatMessage[]>(k, (prev = []) =>
      prev.map((m) => (m.id === assistantId ? { ...m, content: `에러: ${message}` } : m)),
    );
  };

  const ensureClientConversationId = () => {
    if (conversationId) return conversationId;

    if (!tempIdRef.current) tempIdRef.current = `temp-${uid()}`;

    router.push(`/c/${tempIdRef.current}`);

    return tempIdRef.current;
  };

  const moveCache = (from: MessagesKey, to: MessagesKey) => {
    const data = qc.getQueryData<ChatMessage[]>(from);
    if (data) qc.setQueryData(to, data);
    qc.removeQueries({ queryKey: from });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const clientConversationId = ensureClientConversationId();
    const k = messagesKey(clientConversationId);

    const snapshot = (qc.getQueryData<ChatMessage[]>(k) ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };

    const assistantId = uid();
    const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "" };

    setInput("");
    qc.setQueryData<ChatMessage[]>(k, (prev = []) => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { conversationId: newConversationId } = await streamMutation.mutateAsync({
        messages: [...snapshot, { role: "user", content: text }],
        conversationId,
        signal: controller.signal,
        onToken: appendToAssistant(k, assistantId),
        onQueryRouting: setAssistantRouting(k, assistantId),
      });

      if (newConversationId && newConversationId !== clientConversationId) {
        const realKey = messagesKey(newConversationId);

        moveCache(k, realKey);
        router.replace(`/c/${newConversationId}`);

        tempIdRef.current = null;

        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: realKey });
      } else {
        qc.invalidateQueries({ queryKey: k });
      }
    } catch (e: unknown) {
      const message =
        e instanceof DOMException && e.name === "AbortError"
          ? "요청이 취소됐습니다."
          : e instanceof Error
            ? e.message
            : "Unknown error";

      setAssistantError(k, assistantId, message);
    } finally {
      abortRef.current = null;
    }
  };

  return { input, setInput, loading, canSend, send, stop };
}
