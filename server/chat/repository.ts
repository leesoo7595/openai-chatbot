import { prisma } from "@/server/db";
import type { Msg } from "./types";

export async function ensureConversation(conversationId?: string) {
  if (!conversationId) return prisma.conversation.create({ data: {} });
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  return conv ?? prisma.conversation.create({ data: {} });
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
