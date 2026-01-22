import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../api";

export function useConversationsQuery() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    staleTime: 1000 * 60 * 1,
  });
}
