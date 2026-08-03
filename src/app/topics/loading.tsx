export default function TopicsLoading() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="h-9 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-64 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white ring-1 ring-ink-900/[0.06]"
            >
              <div className="h-40 w-full bg-ink-100 animate-pulse motion-reduce:animate-none" />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-6 w-32 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                  <div className="h-6 w-16 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                </div>

                <div className="mt-3 h-4 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />

                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                  <div className="h-3 w-4/5 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}