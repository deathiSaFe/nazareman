import type { Metadata } from 'next';
import { AddTopicFlow } from '@/components/add-topic/AddTopicFlow';

export const metadata: Metadata = {
  title: 'افزودن موضوع جدید - نظرمن',
  description: 'موضوع جدیدی به نظرمن اضافه کنید',
};

export default async function AddTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="mx-auto w-full max-w-2xl px-5 pt-10">
        <header className="mb-8 text-center">
          <p className="mx-auto max-w-md text-[15px] font-light leading-7 text-ink-600 md:text-base">
            موضوعی را معرفی کنید تا دیگران بتوانند درباره آن نظر بدهند.
          </p>
        </header>

        <AddTopicFlow initialName={name} />
      </div>
    </main>
  );
}