import type { Prisma } from "@prisma/client";

import type { QueryRouting } from "@/lib/streaming/types";
import { prisma } from "@/server/db";
import type { Msg } from "./types";

export async function ensureConversation(conversationId?: string) {
  if (!conversationId) {
    const conv = await prisma.conversation.create({ data: {} });
    return { ...conv, systemPrompt: conv.systemPrompt ?? "" };
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  const ensured = conv ?? (await prisma.conversation.create({ data: {} }));

  return { ...ensured, systemPrompt: ensured.systemPrompt ?? "" };
}

export async function saveLastUserMessage(
  conversationId: string,
  messages: Msg[],
) {
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

export async function createAssistantPlaceholder(conversationId: string) {
  return prisma.message.create({
    data: { conversationId, role: "assistant", content: "" },
    select: { id: true },
  });
}

export async function saveAssistantRouting(params: {
  messageId: string;
  selectedModel: string;
  queryRouting: QueryRouting;
}) {
  return prisma.message.update({
    where: { id: params.messageId },
    data: {
      selectedModel: params.selectedModel,
      queryRouting: params.queryRouting satisfies Prisma.InputJsonValue,
    },
  });
}

export async function finalizeAssistantContent(
  messageId: string,
  content: string,
) {
  return prisma.message.update({
    where: { id: messageId },
    data: { content },
  });
}
