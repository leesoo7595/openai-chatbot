"use client";

export default function ChatHeader({
  loading,
  onStop,
}: {
  loading: boolean;
  onStop: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold">Chat</h1>
          <p className="text-xs text-zinc-400">
            {loading ? "생성 중..." : "질문을 입력해봐"}
          </p>
        </div>

        {loading && (
          <button
            onClick={onStop}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
          >
            중지
          </button>
        )}
      </div>
    </header>
  );
}
