import { createChatStream } from "@/server/chat/service";
import type { Msg } from "@/server/chat/types";

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = (await req.json()) as {
      messages: Msg[];
      conversationId?: string;
    };

    const { stream, conversationId: ensuredId } = await createChatStream({
      messages,
      conversationId,
    });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              controller.enqueue(
                encoder.encode(JSON.stringify(chunk) + "\n")
              );
            }
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Conversation-Id": ensuredId,
        },
      }
    );
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
