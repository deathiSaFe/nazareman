'use client';

import { useState } from 'react';

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

type PendingComment = {
  id: string;
  body: string;
  topicName: string;
  createdAt: string;
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

export function CommentsModerationClient({
  comments: initialComments,
}: {
  comments: PendingComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    setMessage(null);
    setError(null);
    setLoadingId(id);

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
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

      setComments((prev) => prev.filter((comment) => comment.id !== id));

      setMessage(status === 'APPROVED' ? 'نظر تأیید شد.' : 'نظر رد شد.');
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

      {comments.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-ink-600 ring-1 ring-ink-900/[0.06]">
          نظر در انتظار بررسی وجود ندارد.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-3xl bg-white p-5 ring-1 ring-ink-900/[0.06] md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-ink-900">
                    موضوع: {comment.topicName}
                  </p>

                  <p className="mt-1 text-xs text-ink-400">
                    {formatPersianDate(comment.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(comment.id, 'APPROVED')}
                    disabled={loadingId === comment.id}
                    className="rounded-full bg-turquoise-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-turquoise-700 disabled:pointer-events-none disabled:opacity-40"
                  >
                    تأیید
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus(comment.id, 'REJECTED')}
                    disabled={loadingId === comment.id}
                    className="rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-40"
                  >
                    رد
                  </button>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-800">
                {comment.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}