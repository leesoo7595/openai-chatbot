import type { ChatCompletionChunk } from "openai/resources/chat/completions";

import type { QueryRouting } from "@/lib/streaming/types";

export type ChatCompletionChunkWithRouting =
  ChatCompletionChunk & { query_routing: QueryRouting };

export function hasQueryRouting(
  chunk: ChatCompletionChunk
): chunk is ChatCompletionChunkWithRouting {
  const candidate = (chunk as unknown as { query_routing?: unknown }).query_routing;

  return typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
}

export type Msg = { role: "user" | "assistant" | "system"; content: string };

