import OpenAI from "openai";
import { prisma } from "@/server/db";

export const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

type Msg = { role: "user" | "assistant" | "system"; content: string };

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json()  as {
      messages: Msg[];
      conversationId?: string;
    };

    const conv =
      conversationId
      ? await prisma.conversation.findUnique({ where: { id: conversationId } })
      : null;
    const ensuredConv = conv ?? await prisma.conversation.create({ data: {} });

    const systemPrompt = ensuredConv.systemPrompt?.trim();
    const hasSystemMessage = messages.some((m) => m.role === "system");
    const finalMessages: Msg[] =
      systemPrompt && !hasSystemMessage
        ? [{ role: "system", content: systemPrompt }, ...messages]
        : messages;

    const lastUser = [...finalMessages].reverse().find(m => m.role === "user");
    if (lastUser?.content) {
      await prisma.message.create({
        data: {
          conversationId: ensuredConv.id,
          role: "user",
          content: lastUser.content,
        },
      });
    }

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || "gpt-4o-mini-2024-07-18",
      messages: finalMessages,
      stream: true,
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
          // TODO: 이후 SSE로 변경 시 수정 필요
          "X-Conversation-Id": ensuredConv.id,
        },
      }
    );
  } catch (e: unknown) {
    let message = "Unknown error";
    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}