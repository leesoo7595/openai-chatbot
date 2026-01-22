"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useConversationsQuery } from "../hooks/useConversationsQuery";
import { ConversationItem } from "./ConversationItem";

export function ConversationSidebar() {
  const { data: conversations = [] } = useConversationsQuery();
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="p-3">
        <Link
          href="/"
          className="
            flex items-center justify-center
            rounded-xl border border-zinc-800
            bg-zinc-900 px-3 py-2.5
            text-sm font-medium text-zinc-100
            hover:bg-zinc-800 transition
          "
        >
          새로운 대화 시작
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="px-2 py-2 text-[11px] font-semibold tracking-wide text-zinc-500">
          최근 대화
        </div>

        <div className="space-y-1">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={pathname === `/c/${conv.id}`}
              onDelete={() => alert("삭제 기능 준비 중")}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 px-3 py-3">
        <div className="text-center text-[11px] text-zinc-500">Powered by My Chat App</div>
      </div>
    </aside>
  );
}
