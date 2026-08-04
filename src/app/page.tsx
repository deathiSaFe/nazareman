import type { Metadata } from 'next';
import { SearchSection } from '@/components/home/SearchSection';
import { BrandMark } from '@/components/home/BrandMark';
import { AmbientBackground } from '@/components/home/AmbientBackground';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'نظرمن - نظر دیگران را بدانید',
  description:
    'نظرمن جایی است که می‌توانید نظرات دیگران را درباره موضوعات مختلف بخوانید و نظر خود را ثبت کنید.',
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-paper overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-16">
        <BrandMark />

        <h1 className="mt-6 text-center font-display text-3xl text-ink-900 md:text-4xl">
          نظر دیگران را بدانید
        </h1>

        <p className="mt-3 max-w-md text-center text-[15px] leading-7 text-ink-600">
          موضوعی را جستجو کنید، نظرات دیگران را بخوانید و نظر خود را ثبت کنید.
        </p>

        <div className="mt-8 w-full max-w-xl">
          <SearchSection />
        </div>

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
      </div>
    </main>
  );
}