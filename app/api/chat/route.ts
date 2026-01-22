import { createChatStream } from "@/server/chat/service";
import type { Msg } from "@/server/chat/types";
import { prisma } from "@/server/db";

function deriveTitleFromFirstUserMessage(messages: Msg[]) {
  const firstUser = messages.find((m) => m.role === "user")?.content ?? "";
  const text = firstUser.replace(/\s+/g, " ").trim();
  if (!text) return "새 대화";
  return text.length > 24 ? text.slice(0, 24) + "…" : text;
}

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

    const title = deriveTitleFromFirstUserMessage(messages);
    await prisma.conversation.update({ where: { id: ensuredId }, data: { title } });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
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
      },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
