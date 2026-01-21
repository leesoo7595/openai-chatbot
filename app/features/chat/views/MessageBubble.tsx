"use client";

import { Role } from "../types";

export default function MessageBubble({
  role,
  content,
}: {
  role: Exclude<Role, "system">;
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-white text-zinc-900"
            : "border border-white/10 bg-white/5 text-zinc-100",
        ].join(" ")}
      >
        {content || (!isUser ? "…" : "")}
      </div>
    </div>
  );
}
