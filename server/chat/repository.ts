import type { Prisma } from "@prisma/client";

import type { QueryRouting } from "@/lib/streaming/types";
import { prisma } from "@/server/db";
import type { Msg } from "./types";

async function touchConversation(
  tx: Prisma.TransactionClient,
  conversationId: string,
  content: string,
  createdAt: Date,
) {
  await tx.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: createdAt,
      lastMessagePreview: content.slice(0, 300),
      // updatedAt은 @updatedAt이 자동 갱신
    },
  });
}

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
  clientMessageId?: string,
) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content) return;

  // Prevent duplicate saves using clientMessageId for idempotency
  if (clientMessageId) {
    const existing = await prisma.message.findUnique({
      where: { clientMessageId },
    });
    if (existing) return;
  }

  await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId,
        role: "user",
        content: lastUser.content,
        clientMessageId,
      },
    });

    await touchConversation(
      tx,
      conversationId,
      lastUser.content,
      msg.createdAt,
    );
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
  return prisma.$transaction(async (tx) => {
    const msg = await tx.message.update({
      where: { id: messageId },
      data: { content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        conversationId: true,
      },
    });

    await touchConversation(tx, msg.conversationId, content, new Date());

    return msg;
  });
}
