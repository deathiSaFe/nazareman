import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PageView } from '@/components/page/PageView';
import type { PageData, PageLink } from '@/types/topic';

export const dynamic = 'force-dynamic';

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${protocol}://${host}`;

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/topics/${encodeURIComponent(id)}`,
      { cache: 'no-store' }
    );
  } catch {
    return (
      <main className="min-h-screen bg-paper">
        <div className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="rounded-3xl bg-white p-8 text-center text-ink-600 ring-1 ring-ink-900/[0.06]">
            دریافت صفحه ممکن نشد.
          </div>
        </div>
      </main>
    );
  }

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    return (
      <main className="min-h-screen bg-paper">
        <div className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="rounded-3xl bg-white p-8 text-center text-ink-600 ring-1 ring-ink-900/[0.06]">
            دریافت صفحه ممکن نشد.
          </div>
        </div>
      </main>
    );
  }

  let topic: Record<string, unknown>;

  try {
    topic = await response.json();
  } catch {
    return (
      <main className="min-h-screen bg-paper">
        <div className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="rounded-3xl bg-white p-8 text-center text-ink-600 ring-1 ring-ink-900/[0.06]">
            دریافت صفحه ممکن نشد.
          </div>
        </div>
      </main>
    );
  }

  const page: PageData = {
    id: String(topic.id),
    slug: String(topic.slug),
    name: String(topic.name),
    description: (topic.description as string | null) ?? null,
    workingHours: (topic.workingHours as string | null) ?? null,
    imageUrl: (topic.imageUrl as string | null) ?? null,
    address: (topic.address as string | null) ?? null,
    scope: topic.scope as PageData['scope'],
    status: topic.status as PageData['status'],
    province: (topic.province as PageData['province']) ?? null,
    city: (topic.city as PageData['city']) ?? null,
    types: ((topic.types as Array<{ id: string; label: string; kind: 'PRIMARY' | 'SECONDARY' }>) ?? []).map(
      (type) => ({ id: type.id, label: type.label, kind: type.kind })
    ),
    links: ((topic.links as PageLink[]) ?? []).map((link) => ({
      id: link.id,
      platform: link.platform,
      label: link.label ?? null,
      value: link.value,
    })),
    comments: ((topic.comments as Array<{
      id: string;
      body: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      createdAt: string;
    }>) ?? []).map((comment) => ({
      id: comment.id,
      body: comment.body,
      status: comment.status,
      createdAt: comment.createdAt,
    })),
  };

  return (
    <main className="min-h-screen bg-paper pb-10">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-5 sm:py-6">
        <PageView page={page} />
      </div>
    </main>
  );
}
