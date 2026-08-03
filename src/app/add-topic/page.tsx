import Link from 'next/link';
import type { Metadata } from 'next';
import { AmbientBackground } from '@/components/home/AmbientBackground';
import { AddTopicFlow } from '@/components/add-topic/AddTopicFlow';
import { ArrowRightIcon } from '@/components/icons';

export const metadata: Metadata = {
  title: 'افزودن موضوع جدید | نظرمن',
  description: 'اگر موضوع موردنظر شما وجود ندارد، آن را اضافه کنید تا دیگران بتوانند درباره آن نظر بدهند.',
};

export default function AddTopicPage() {
  return (
    <main className="relative min-h-dvh overflow-x-clip">
      <AmbientBackground />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pb-20 pt-6 md:px-8 md:pt-8">
        {/* top bar — back to home (RTL: back points right) */}
        <Link
          href="/"
          aria-label="بازگشت به صفحه اصلی"
          className="group grid size-11 place-items-center rounded-full bg-white/85 text-ink-900/70 shadow-[0_4px_14px_-6px_rgba(21,67,63,0.25)] ring-1 ring-ink-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:text-turquoise-700 hover:ring-turquoise-600/40 active:translate-y-0 active:scale-95"
        >
          <ArrowRightIcon strokeWidth={2.2} className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        <header className="mt-7 md:mt-9">
          <h1 className="font-display text-[34px] leading-[1.2] text-ink-900 sm:text-4xl md:text-[44px]">
            افزودن موضوع جدید
          </h1>
          <p className="mt-3 max-w-lg text-[14px] leading-7 text-ink-900/55 md:text-[15px]">
            اگر موضوع موردنظر شما وجود ندارد، آن را اضافه کنید تا دیگران بتوانند درباره آن نظر بدهند.
          </p>
        </header>

        <AddTopicFlow className="mt-8 md:mt-10" />
      </div>
    </main>
  );
}