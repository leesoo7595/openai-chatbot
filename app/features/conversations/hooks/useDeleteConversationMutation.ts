"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteConversation } from "../api";

export function useDeleteConversationMutation(opts?: { onDeleted?: (id: string) => void }) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: async (_data, deletedId) => {
      opts?.onDeleted?.(deletedId);
      await qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
