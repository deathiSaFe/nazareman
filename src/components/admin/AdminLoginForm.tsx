'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLoginFormProps {
  hasInvalidCookie?: boolean;
  notConfigured?: boolean;
}

export function AdminLoginForm({
  hasInvalidCookie = false,
  notConfigured = false,
}: AdminLoginFormProps) {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const value = password.trim();

    if (!value) {
      setError('رمز مدیریت را وارد کنید.');
      return;
    }

    setError(null);

    try {
      window.localStorage.setItem('admin_password', value);

      const secure = window.location.protocol === 'https:' ? '; secure' : '';

      document.cookie = `admin_password=${encodeURIComponent(value)}; path=/; max-age=604800; samesite=strict${secure}`;

      router.refresh();
    } catch {
      setError('ذخیره رمز مدیریت ممکن نشد.');
    }
  }

  const showInvalidCookieMessage = hasInvalidCookie && !touched && !notConfigured;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)] md:p-8"
      >
        <h1 className="font-display text-2xl text-ink-900">ورود مدیریت</h1>

        <p className="mt-2 text-sm text-ink-600">
          برای دسترسی به پنل مدیریت، رمز مدیریت را وارد کنید.
        </p>

        {notConfigured ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700"
          >
            رمز مدیریت در سرور تنظیم نشده است. مقدار ADMIN_PASSWORD را در محیط
            خود تنظیم کنید.
          </p>
        ) : null}

        {showInvalidCookieMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700"
          >
            رمز مدیریت معتبر نیست.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}

        <label
          htmlFor="admin-password"
          className="mt-6 block text-sm font-medium text-ink-700"
        >
          رمز مدیریت
        </label>

        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setTouched(true);

            if (error) {
              setError(null);
            }
          }}
          disabled={notConfigured}
          autoComplete="current-password"
          className="mt-2 w-full rounded-[22px] border border-ink-200 bg-paper p-4 text-ink-900 outline-none transition-shadow placeholder:text-ink-400 focus:ring-2 focus:ring-turquoise-500 focus:shadow-md disabled:opacity-40"
        />

        <button
          type="submit"
          disabled={notConfigured}
          className="mt-6 w-full rounded-full bg-turquoise-600 px-7 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all hover:-translate-y-0.5 hover:bg-turquoise-700 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          ورود
        </button>
      </form>
    </main>
  );
}