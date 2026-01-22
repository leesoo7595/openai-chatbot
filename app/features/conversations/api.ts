import { Conversation } from "./types";
import { ChatMessage } from "@/app/features/chat/types";

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error("Failed to fetch conversations");
  }
  return response.json();
}

export async function deleteConversation(id: string) {
  const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(typeof data?.error === "string" ? data.error : "Delete failed");
  }
}

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/conversations/${conversationId}/messages`);
  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }
  return response.json();
}
