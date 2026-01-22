import { prisma } from "@/server/db";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      lastMessageAt: true,
      lastMessagePreview: true,
      createdAt: true,
    },
    take: 50,
  });

  return Response.json(conversations, {
    headers: { "Cache-Control": "no-store" },
  });
}
