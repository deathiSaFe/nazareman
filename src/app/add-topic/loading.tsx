export default function AddTopicLoading() {
  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="mx-auto w-full max-w-2xl px-5 pt-10">
        <div className="h-8 w-48 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-64 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />

        <div className="mt-8 space-y-6">
          <div className="h-6 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-ink-100 animate-pulse motion-reduce:animate-none"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}