import ChatView from "@/app/features/chat/views/ChatView";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatView conversationId={id} />;
}
