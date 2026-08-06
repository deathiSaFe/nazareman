import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { primaryTypeLabel } from '@/types/topic';
import { CommentForm } from '@/components/topic/CommentForm';


export const dynamic = 'force-dynamic';

type TopicProvince = {
  name: string;
  slug: string;
};

type TopicCity = {
  name: string;
  slug: string;
  province: TopicProvince;
};

type TopicComment = {
  id: string;
  body: string;
  createdAt: string;
  status: string;
  authorName: string | null;
};

type TopicType = {
  id: string;
  label: string;
  kind: 'PRIMARY' | 'SECONDARY';
};

type TopicDetail = {
  id: string;
  slug: string;
  name: string;
  types: TopicType[];
  description: string;
  imageUrl: string | null;
  status: string;
  city: TopicCity | null;
  comments: TopicComment[];
};

function getCityLabel(city: TopicCity | null): string {
  if (!city) {
    return 'بدون شهر';
  }

  const parts = [city.name, city.province.name].filter(Boolean);

  if (parts.length === 0) {
    return 'بدون شهر';
  }

  return parts.join(' · ');
}

function formatPersianDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ focusComment?: string }>;
}) {
  const { id } = await params;
  const { focusComment } = await searchParams;

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${protocol}://${host}`;

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/topics/${encodeURIComponent(id)}`,
      {
        cache: 'no-store',
      }
    );
  } catch {
    return (
      <main className="min-h-screen bg-paper">
        <div className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="rounded-3xl bg-white p-8 text-center text-ink-600 ring-1 ring-ink-900/[0.06]">
            دریافت موضوع ممکن نشد.
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
            دریافت موضوع ممکن نشد.
          </div>
        </div>
      </main>
    );
  }

  let topic: TopicDetail;

  try {
    topic = await response.json();
  } catch {
    return (
      <main className="min-h-screen bg-paper">
        <div className="mx-auto w-full max-w-3xl px-5 py-10">
          <div className="rounded-3xl bg-white p-8 text-center text-ink-600 ring-1 ring-ink-900/[0.06]">
            دریافت موضوع ممکن نشد.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <Link
          href="/topics"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-turquoise-700 transition-colors hover:bg-turquoise-600/10"
        >
          بازگشت به موضوعات
        </Link>

        <article className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)]">
          {topic.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={topic.imageUrl}
                alt={topic.name}
                className="h-56 w-full object-cover md:h-72"
              />
            </>
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-turquoise-50 text-sm font-medium text-turquoise-700 md:h-72">
              تصویر ندارد
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="font-display text-3xl text-ink-900">
                {topic.name}
              </h1>

              <span className="rounded-full bg-turquoise-600/10 px-4 py-1.5 text-xs font-bold text-turquoise-700">
                {primaryTypeLabel(topic.types.map((type) => type.label))}
              </span>
            </div>

            {topic.types.length > 1 && (
              <p className="mt-2 text-xs font-medium text-ink-400">
                {topic.types.slice(1).map((type) => type.label).join('، ')}
              </p>
            )}

            <p className="mt-3 text-sm text-ink-500">
              {getCityLabel(topic.city)}
            </p>

            <p className="mt-6 whitespace-pre-line text-[15px] leading-7 text-ink-700">
              {topic.description}
            </p>
          </div>
        </article>

                {topic.status === 'PENDING' && (
          <div className="mt-10 rounded-2xl bg-saffron-50 border border-saffron-200/60 p-4 text-sm text-ink-800">
            <p className="font-bold">این موضوع در انتظار بررسی است.</p>
            <p className="mt-1">پس از تأیید مدیریت، برای همه کاربران قابل مشاهده خواهد بود.</p>
          </div>
        )}

        <CommentForm
  topicId={topic.id}
  autoFocus={focusComment === 'true'}
/>

        <section aria-label="نظرات موضوع" className="mt-10">
          <h2 className="font-display text-2xl text-ink-900">نظرات</h2>

          {topic.comments.length === 0 ? (
            <div className="mt-4 rounded-3xl bg-white p-6 text-sm text-ink-600 ring-1 ring-ink-900/[0.06]">
              هنوز نظری برای این موضوع ثبت نشده است.
            </div>
          ) : (
                        <div className="mt-4 space-y-4">
              {topic.comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-3xl bg-white p-5 ring-1 ring-ink-900/[0.06]"
                >
                  <p className="whitespace-pre-line text-[15px] leading-7 text-ink-800">
                    {comment.body}
                  </p>

                  <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                    <span>{comment.authorName ?? 'ناشناس'}</span>
                    <span>{formatPersianDate(comment.createdAt)}</span>

                    {comment.status === 'PENDING' && (
                      <span className="rounded-full bg-saffron-500/10 px-2 py-0.5 text-saffron-700 font-bold">
                        در انتظار بررسی
                      </span>
                    )}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
