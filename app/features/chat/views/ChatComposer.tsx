"use client";

export default function ChatComposer({
  value,
  onChange,
  loading,
  canSend,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  canSend: boolean;
  onSend: () => void;
}) {
  return (
    <footer className="sticky bottom-0 border-t border-white/10 bg-zinc-950/80 px-4 py-4 backdrop-blur">
      <div className="flex gap-2">
        <input
          className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-white/10"
          placeholder="메시지를 입력하세요..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={loading}
        />
        <button
          className="h-12 rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-900 disabled:opacity-40"
          onClick={onSend}
          disabled={!canSend}
        >
          보내기
        </button>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        Enter 전송 · Shift+Enter 줄바꿈
      </p>
    </footer>
  );
}
