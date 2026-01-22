import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../api";

export function useConversationMessagesQuery(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () => getMessages(conversationId!),
    enabled: !!conversationId,
    staleTime: Infinity,
  });
}
