export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto w-full max-w-4xl px-5 py-10">
        <div className="h-8 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-64 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />

        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white p-5 ring-1 ring-ink-900/[0.06]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="h-6 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                  <div className="h-4 w-32 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                  <div className="h-8 w-16 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
                </div>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}