import OpenAI from "openai";
import type { Msg } from "./types";
import { ensureConversation, saveLastUserMessage } from "./repository";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createChatStream(params: {
  messages: Msg[];
  conversationId?: string;
}) {
  const conv = await ensureConversation(params.conversationId);

  const systemPrompt = conv.systemPrompt?.trim();
  const hasSystemMessage = params.messages.some((m) => m.role === "system");
  const finalMessages: Msg[] =
    systemPrompt && !hasSystemMessage
      ? [{ role: "system", content: systemPrompt }, ...params.messages]
      : params.messages;

  await saveLastUserMessage(conv.id, finalMessages);

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_API_MODEL || "gpt-4o-mini-2024-07-18",
    messages: finalMessages,
    stream: true,
  });

  return { stream, conversationId: conv.id };
}
