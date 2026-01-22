import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">Chat</div>

          <Link
            href="/c"
            className="rounded-lg bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-white"
          >
            새 채팅 시작
          </Link>
        </header>

        {/* Hero */}
        <section className="mt-14">
          <h1 className="text-3xl font-semibold tracking-tight">무엇을 도와줄까?</h1>
          <p className="mt-3 max-w-xl text-zinc-400">일반 질문, 요약 등 필요한 걸 바로 물어봐.</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["이 글 요약해줘", "이메일 답장 문장 다듬어줘", "이 코드 에러 원인 알려줘"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs text-zinc-300"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </section>

        <section className="mt-12">
          <Link
            href="/c"
            className="group block rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:bg-zinc-900/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">빠른 시작</div>
                <p className="mt-2 text-sm text-zinc-400">새 채팅을 시작하고 바로 질문해.</p>
              </div>

              <div className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 group-hover:border-zinc-700">
                Enter ↵
              </div>
            </div>

            <div className="mt-4 text-sm font-medium text-zinc-100 underline decoration-zinc-700 underline-offset-4 group-hover:decoration-zinc-400">
              새 채팅 화면으로 이동
            </div>
          </Link>

          <p className="mt-3 text-xs text-zinc-500">
            팁: 새 채팅은 <span className="text-zinc-300">/c</span> 에서 시작돼.
          </p>
        </section>

        <footer className="mt-auto pt-12 text-xs text-zinc-500">
          © {new Date().getFullYear()} Chat
        </footer>
      </div>
    </main>
  );
}
