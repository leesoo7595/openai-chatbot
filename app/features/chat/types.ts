export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Exclude<Role, "system">; // UI에서는 user/assistant만
  content: string;
};

export type ChatMessageForAPI = {
  role: Role;
  content: string;
};
