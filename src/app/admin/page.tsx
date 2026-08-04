import Link from 'next/link';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import {
  getAdminPassword,
  validateAdminPassword,
  getAdminPasswordFromCookie,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'مدیریت - نظرمن',
};

export default async function AdminPage() {
  if (!getAdminPassword()) {
    return <AdminLoginForm notConfigured />;
  }

  const adminPassword = await getAdminPasswordFromCookie();

  if (!validateAdminPassword(adminPassword)) {
    return <AdminLoginForm hasInvalidCookie={adminPassword.length > 0} />;
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-display text-3xl text-ink-900">مدیریت نظرمن</h1>

        <p className="mt-2 text-sm text-ink-600">
          پنل بررسی موضوعات و نظرات در انتظار تأیید
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/topics"
            className="rounded-3xl bg-white p-6 text-center font-display text-xl text-turquoise-700 ring-1 ring-ink-900/[0.06] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(26,99,93,0.45)]"
          >
            بررسی موضوعات
          </Link>

          <Link
            href="/admin/comments"
            className="rounded-3xl bg-white p-6 text-center font-display text-xl text-turquoise-700 ring-1 ring-ink-900/[0.06] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(26,99,93,0.45)]"
          >
            بررسی نظرات
          </Link>
        </div>
      </div>
    </main>
  );
}