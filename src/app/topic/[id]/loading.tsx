export default function TopicLoading() {
  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <div className="h-8 w-32 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />

        <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-ink-900/[0.06]">
          <div className="h-56 w-full bg-ink-100 animate-pulse motion-reduce:animate-none md:h-72" />

          <div className="p-6 md:p-8">
            <div className="h-8 w-48 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
            <div className="mt-3 h-4 w-32 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
            <div className="mt-6 space-y-2">
              <div className="h-3 w-full rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-4/5 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-3/5 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-5 ring-1 ring-ink-900/[0.06]">
          <div className="h-6 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
          <div className="mt-3 h-24 w-full rounded-2xl bg-ink-100 animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    </main>
  );
}