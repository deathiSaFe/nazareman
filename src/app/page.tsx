import type { Metadata } from 'next';
import { SearchSection } from '@/components/home/SearchSection';
import FloatingActionButton from '@/components/home/FloatingActionButton';

export const metadata: Metadata = {
  title: 'نظرمن - نظر دیگران را بدانید',
  description:
    'نظرمن جایی است که می‌توانید نظرات دیگران را درباره موضوعات مختلف بخوانید و نظر خود را ثبت کنید.',
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-paper overflow-hidden">
      {/* Ambient background gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-turquoise-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-saffron-200/15 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 pt-16 pb-28">
        {/* Motto */}
        <p className="text-center text-ink-500 text-lg md:text-xl font-light tracking-wide mb-10 max-w-md leading-relaxed">
          <span className="inline-block relative">
            <span className="bg-gradient-to-bl from-turquoise-700 to-emerald-500 bg-clip-text text-transparent font-medium">
              هر نظر
            </span>
            <span className="text-ink-300 mx-1">،</span>
            <span className="text-ink-700">
              کمک به یک انتخاب بهتر
            </span>
          </span>
        </p>

        {/* Search */}
        <div className="w-full max-w-xl">
          <SearchSection />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </main>
  );
}