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
              const text = chunk.choices[0]?.delta?.content ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            }
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
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
