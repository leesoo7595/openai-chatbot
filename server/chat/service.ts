import OpenAI from "openai";
import type { ChatCompletionChunk } from "openai/resources"

import { hasQueryRouting, type Msg } from "./types";
import {
  createAssistantPlaceholder,
  ensureConversation,
  saveLastUserMessage,
  saveAssistantRouting,
  finalizeAssistantContent,
} from "./repository";

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createChatStream(params: { messages: Msg[]; conversationId?: string }) {
  const conv = await ensureConversation(params.conversationId);

  const systemPrompt = conv.systemPrompt.trim();
  const hasSystemMessage = params.messages.some((m) => m.role === "system");
  const finalMessages: Msg[] =
    systemPrompt && !hasSystemMessage
      ? [{ role: "system", content: systemPrompt }, ...params.messages]
      : params.messages;

  await saveLastUserMessage(conv.id, finalMessages);

  const assistant = await createAssistantPlaceholder(conv.id);
  const assistantMessageId = assistant.id;

  const rawStream: AsyncIterable<ChatCompletionChunk> = await openai.chat.completions.create({
    model: process.env.OPENAI_API_MODEL || "gpt-4o-mini-2024-07-18",
    messages: finalMessages,
    stream: true,
  });

  async function* streamWithPersistence() {
    let routingSaved = false;
    let fullText = "";

    try {
      for await (const chunk of rawStream) {
        // routing 저장 (첫 chunk에서만)
        if (!routingSaved && hasQueryRouting(chunk)) {
          routingSaved = true;
          await saveAssistantRouting({
            messageId: assistantMessageId,
            selectedModel: chunk.query_routing.selected_model,
            queryRouting: chunk.query_routing,
          });
        }

        const text = chunk.choices?.[0]?.delta?.content ?? "";
        if (text) fullText += text;

        yield chunk; // route로 그대로 전달
      }

      await finalizeAssistantContent(assistantMessageId, fullText);
    } catch (e) {
      await finalizeAssistantContent(
        assistantMessageId,
        `에러: ${e instanceof Error ? e.message : String(e)}`
      );
      throw e;
    }
  }

  return {
    stream: streamWithPersistence(),
    conversationId: conv.id,
    assistantMessageId,
  };
}
