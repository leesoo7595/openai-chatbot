"use client";

import Link from "next/link";
import type { Conversation } from "../types";

export function ConversationItem({
  conversation,
  isActive,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onDelete?: (id: string) => void;
}) {
  return (
    <Link
      href={`/c/${conversation.id}`}
      className={[
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
        "border",
        isActive
          ? "border-zinc-700 bg-zinc-800 text-zinc-100"
          : "border-transparent text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900",
      ].join(" ")}
    >
      <span
        className={[
          "h-2.5 w-2.5 rounded-full transition",
          isActive ? "bg-zinc-100" : "bg-zinc-600 group-hover:bg-zinc-500",
        ].join(" ")}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{conversation.title.trim()}</div>
        <div className="mt-0.5 truncate text-[12px] text-zinc-500">
          {conversation.lastMessagePreview || " "}
        </div>
      </div>

      {isActive && (
        <button
          type="button"
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            rounded-lg border border-transparent
            px-2 py-1 text-[12px]
            text-zinc-400 opacity-0
            transition
            group-hover:opacity-100
            hover:bg-zinc-700 hover:text-zinc-100
          "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.(conversation.id);
          }}
        >
          삭제
        </button>
      )}
    </Link>
  );
}
