import type { QueryRouting } from "@/lib/streaming/types"

export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Exclude<Role, "system">;
  content: string;

  selectedModel?: string;
  queryRouting?: QueryRouting;
};

export type ChatMessageForAPI = {
  role: Role;
  content: string;
};
