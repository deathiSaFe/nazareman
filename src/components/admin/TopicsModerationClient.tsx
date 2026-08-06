'use client';

import { useState } from 'react';
import { topicTypesLabel } from '@/types/topic';

function getStoredAdminPassword(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const localPassword = window.localStorage.getItem('admin_password');

  if (localPassword) {
    return localPassword;
  }

  const cookieRow = document.cookie
    .split('; ')
    .find((row) => row.startsWith('admin_password='));

  const cookieValue = cookieRow?.split('=')[1] ?? '';

  try {
    return decodeURIComponent(cookieValue);
  } catch {
    return cookieValue;
  }
}

type PendingTopic = {
  id: string;
  name: string;
  types: string[];
  description: string;
  cityName: string;
  submittedAt: string;
};

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

export function TopicsModerationClient({
  topics: initialTopics,
}: {
  topics: PendingTopic[];
}) {
  const [topics, setTopics] = useState(initialTopics);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    setMessage(null);
    setError(null);
    setLoadingId(id);

    try {
      const response = await fetch(`/api/admin/topics/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': encodeURIComponent(getStoredAdminPassword()),
           },
        body: JSON.stringify({ status }),
      });

      const payload = await response.json().catch(() => null);
      if (response.status === 401) {
        setError('رمز مدیریت معتبر نیست.');
        return;
          }

      if (!response.ok) {
        setError(payload?.error ?? 'عملیات ممکن نشد.');
        return;
      }

      setTopics((prev) => prev.filter((topic) => topic.id !== id));

      setMessage(
        status === 'APPROVED' ? 'موضوع تأیید شد.' : 'موضوع رد شد.'
      );
    } catch {
      setError('عملیات ممکن نشد.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="mt-8">
      {message ? (
        <div className="mb-4 rounded-2xl bg-turquoise-600/10 p-3 text-sm text-turquoise-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {topics.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-ink-600 ring-1 ring-ink-900/[0.06]">
          موضوع در انتظار بررسی وجود ندارد.
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <article
              key={topic.id}
              className="rounded-3xl bg-white p-5 ring-1 ring-ink-900/[0.06] md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-ink-900">
                    {topic.name}
                  </h2>

                  <p className="mt-1 text-sm text-ink-500">
                    {topicTypesLabel(topic.types)} · {topic.cityName}
                  </p>

                  <p className="mt-1 text-xs text-ink-400">
                    {formatPersianDate(topic.submittedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(topic.id, 'APPROVED')}
                    disabled={loadingId === topic.id}
                    className="rounded-full bg-turquoise-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-turquoise-700 disabled:pointer-events-none disabled:opacity-40"
                  >
                    تأیید
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(topic.id, 'REJECTED')}
                    disabled={loadingId === topic.id}
                    className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-40"
                  >
                    رد
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-700">
                {topic.description}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
