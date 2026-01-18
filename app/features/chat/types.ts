export type Role = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: Exclude<Role, "system">;
  content: string;
};

export type ChatMessageForAPI = {
  role: Role;
  content: string;
};
