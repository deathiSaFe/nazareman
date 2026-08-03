import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TopicsModerationClient } from '@/components/admin/TopicsModerationClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'بررسی موضوعات - نظرمن',
};

export default async function AdminTopicsPage() {
  const pendingTopics = await prisma.topic.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      createdAt: true,
      city: {
        select: {
          name: true,
          province: {
            select: {
              name: true,
            },
          },
        },
      },
      submission: {
        select: {
          createdAt: true,
        },
      },
    },
  });

  const topics = pendingTopics.map((topic) => {
    const cityNameParts = [
      topic.city?.name,
      topic.city?.province?.name,
    ].filter(Boolean);

    return {
      id: topic.id,
      name: topic.name,
      type: topic.type,
      description: topic.description,
      cityName: cityNameParts.length > 0 ? cityNameParts.join(' · ') : 'بدون شهر',
      submittedAt: (topic.submission?.createdAt ?? topic.createdAt).toISOString(),
    };
  });

  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto w-full max-w-4xl px-5 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-turquoise-700 transition-colors hover:bg-turquoise-600/10"
        >
          بازگشت به مدیریت
        </Link>

        <header className="mt-6">
          <h1 className="font-display text-3xl text-ink-900">
            موضوعات در انتظار بررسی
          </h1>
        </header>

        <TopicsModerationClient topics={topics} />
      </div>
    </main>
  );
}