import { prisma } from "@/server/db";
import type { Msg } from "./types";

export async function ensureConversation(conversationId?: string) {
  if (!conversationId) {
    const conv = await prisma.conversation.create({ data: {} });
    return { ...conv, systemPrompt: conv.systemPrompt ?? "" };
  }

  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  const ensured = conv ?? (await prisma.conversation.create({ data: {} }));

  return { ...ensured, systemPrompt: ensured.systemPrompt ?? "" };
}

export async function saveLastUserMessage(conversationId: string, messages: Msg[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content) return;

  await prisma.message.create({
    data: {
      conversationId,
      role: "user",
      content: lastUser.content,
    },
  });
}
