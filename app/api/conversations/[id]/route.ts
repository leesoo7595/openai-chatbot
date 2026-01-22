import { prisma } from "@/server/db";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.conversation.delete({ where: { id } });

    return Response.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
