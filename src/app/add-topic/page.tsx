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
        <header className="mb-8">
          <h1 className="font-display text-3xl text-ink-900">
            افزودن موضوع جدید
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            موضوع جدیدی ایجاد کنید تا دیگران نظر خود را درباره آن بنویسند.
          </p>
        </header>

        <AddTopicFlow initialName={name} />
      </div>
    </main>
  );
}