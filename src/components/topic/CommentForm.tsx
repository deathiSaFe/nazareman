'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface CommentFormProps {
  topicId: string;
}

export function CommentForm({ topicId }: CommentFormProps) {
  const router = useRouter();

  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isSubmitting) return;

    setSuccessMessage(null);

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setError('متن نظر الزامی است.');
      return;
    }

    if (trimmedBody.length < 5) {
      setError('متن نظر باید حداقل ۵ حرف باشد.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/topics/${encodeURIComponent(topicId)}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            body: trimmedBody,
          }),
        }
      );

      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('رمز مدیریت معتبر نیست.');
        return;
      }

      if (!response.ok) {
        setError(payload?.error ?? 'ارسال نظر ممکن نشد.');
        return;
      }

      setBody('');
      setSuccessMessage(payload?.message ?? 'نظر شما برای بررسی ارسال شد.');

      // Re-fetch the server component to update the comments list
      router.refresh();
    } catch {
      setError('ارسال نظر ممکن نشد.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-10 rounded-3xl bg-white p-5 ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)] md:p-6"
    >
      <label
        htmlFor="comment-body"
        className="font-display text-xl text-ink-900"
      >
        ثبت نظر جدید
      </label>

      <textarea
        id="comment-body"
        value={body}
        onChange={(event) => {
          setBody(event.target.value);

          if (error) {
            setError(null);
          }

          if (successMessage) {
            setSuccessMessage(null);
          }
        }}
        rows={4}
        placeholder="نظر خود را بنویسید..."
        disabled={isSubmitting}
        className="mt-3 w-full resize-none rounded-[22px] border border-ink-200 bg-paper p-4 text-[15px] leading-7 text-ink-900 caret-turquoise-700 outline-none transition-shadow placeholder:text-ink-400 focus:ring-2 focus:ring-turquoise-500 focus:shadow-md disabled:opacity-60"
      />

      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p role="status" className="mt-2 text-sm text-turquoise-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-turquoise-600 px-7 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all hover:-translate-y-0.5 hover:bg-turquoise-700 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          {isSubmitting ? 'در حال ارسال...' : 'ارسال نظر'}
        </button>
      </div>
    </form>
  );
}