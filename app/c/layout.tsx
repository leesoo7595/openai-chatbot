import { ConversationSidebar } from "@/app/features/conversations/views/ConversationSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <aside className="w-[280px] flex-shrink-0 border-r border-zinc-800">
        <ConversationSidebar />
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
