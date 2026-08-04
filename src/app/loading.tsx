export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-2xl px-5 py-16">
        <div className="flex flex-col items-center gap-6">
          <div className="h-10 w-40 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
          <div className="h-4 w-64 rounded-full bg-ink-100 animate-pulse motion-reduce:animate-none" />
          <div className="mt-6 h-14 w-full rounded-[22px] bg-ink-100 animate-pulse motion-reduce:animate-none" />
          <div className="mt-4 space-y-3 w-full">
            <div className="h-20 w-full rounded-2xl bg-ink-100 animate-pulse motion-reduce:animate-none" />
            <div className="h-20 w-full rounded-2xl bg-ink-100 animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </div>
    </main>
  );
}