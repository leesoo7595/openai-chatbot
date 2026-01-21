import { prisma } from "@/server/db";

export async function GET(
  _req: Request,
  { params }: { params: { conversationId: string } },
) {
  const { conversationId } = params;

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });

  if (!conv) {
    return new Response("Not Found", { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
      selectedModel: true,
      queryRouting: true,
    },
  });

  return Response.json(messages, {
    headers: { "Cache-Control": "no-store" },
  });
}
