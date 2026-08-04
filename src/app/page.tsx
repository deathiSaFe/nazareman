import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchSection } from '@/components/home/SearchSection';

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

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-turquoise-600 text-white shadow-lg shadow-turquoise-600/30">
            <span className="font-display text-xl">ن</span>
          </div>
          <span className="font-display text-3xl text-ink-900">نظرمن</span>
        </div>

        <h1 className="mt-8 text-center font-display text-3xl text-ink-900 md:text-4xl">
          نظر دیگران را بدانید
        </h1>

        <p className="mt-3 max-w-md text-center text-[15px] leading-7 text-ink-600">
          موضوعی را جستجو کنید، نظرات دیگران را بخوانید و نظر خود را ثبت کنید.
        </p>

        {/* Search */}
        <div className="mt-8 w-full max-w-xl">
          <SearchSection />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/topics"
            className="rounded-full bg-turquoise-600 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all hover:-translate-y-0.5 hover:bg-turquoise-700 active:translate-y-0 active:scale-[0.97]"
          >
            مشاهده موضوعات
          </Link>

          <Link
            href="/add-topic"
            className="rounded-full border border-turquoise-600/30 px-6 py-3 text-sm font-bold text-turquoise-700 transition-all hover:-translate-y-0.5 hover:bg-turquoise-600/10 active:translate-y-0 active:scale-[0.97]"
          >
            ایجاد موضوع جدید
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-ink-400">
          نظرمن — صدای جمعی برای موضوعات روزمره
        </footer>
      </div>
    </main>
  );
}