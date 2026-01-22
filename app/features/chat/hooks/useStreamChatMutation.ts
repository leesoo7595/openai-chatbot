"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { streamChat } from "../api";

export function useStreamChatMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: streamChat,
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ["conversations"] });

      const convId = data?.conversationId;
      if (convId) {
        await qc.invalidateQueries({ queryKey: ["messages", convId] });
      }
    },
  });
}
