import { AmbientBackground } from '@/components/home/AmbientBackground';
import { SearchSection } from '@/components/home/SearchSection';
import { SubmitOpinionFab } from '@/components/home/SubmitOpinionFab';

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-clip">
      <AmbientBackground />

      {/* floating ثبت نظر — top-right, nothing else in the header */}
      <header className="relative z-10 flex px-5 pt-6 md:px-8 md:pt-8">
        <SubmitOpinionFab className="animate-fade-up motion-reduce:animate-none" />
      </header>

      {/* hero — search bar pinned to the vertical center, biased slightly below */}
      <section className="relative z-10 grid flex-1 grid-rows-[1.1fr_auto_auto_1fr] px-5 pb-8 pt-4 md:px-8">
        {/* message — bottom-aligned toward the search */}
        <div className="flex flex-col justify-end pb-8 md:items-center md:pb-10 md:text-center">
          <h1 className="animate-fade-up font-display text-[42px] leading-[1.2] text-ink-900 [animation-delay:120ms] motion-reduce:animate-none sm:text-5xl md:text-[64px] md:leading-[1.15]">
            دنبال{' '}
            <span className="relative inline-block whitespace-nowrap text-turquoise-700">
              هر چیزی
              <svg
                aria-hidden
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                className="absolute inset-x-0 -bottom-1 h-2.5 w-full text-saffron-400"
              >
                <path
                  d="M3 9C33 3.5 82 2.5 117 6"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1}
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-draw motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
                />
              </svg>
            </span>{' '}
            می‌گردید؟
          </h1>

          <p className="mt-4 max-w-md animate-fade-up text-[15px] leading-7 text-ink-900/55 [animation-delay:200ms] motion-reduce:animate-none md:mx-auto md:text-base">
            نظر واقعی مردم را بخوانید، بسنجید و تصمیم بگیرید.
          </p>
        </div>

        {/* renders the two center grid rows: search bar, then chips + CTA */}
        <SearchSection />
      </section>
    </main>
  );
}