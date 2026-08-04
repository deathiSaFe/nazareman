import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CommentsModerationClient } from '@/components/admin/CommentsModerationClient';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import {
  getAdminPassword,
  validateAdminPassword,
  getAdminPasswordFromCookie,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'بررسی نظرات - نظرمن',
};

export default async function AdminCommentsPage() {
  const pendingComments = await prisma.comment.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      topic: {
        select: {
          name: true,
        },
      },
    },
  });
if (!getAdminPassword()) {
  return <AdminLoginForm notConfigured />;
}

const adminPassword = await getAdminPasswordFromCookie();

if (!validateAdminPassword(adminPassword)) {
  return <AdminLoginForm hasInvalidCookie={adminPassword.length > 0} />;
}
  const comments = pendingComments.map((comment) => ({
    id: comment.id,
    body: comment.body,
    topicName: comment.topic?.name ?? 'موضوع نامشخص',
    createdAt: comment.createdAt.toISOString(),
  }));

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
            نظرات در انتظار بررسی
          </h1>
        </header>

        <CommentsModerationClient comments={comments} />
      </div>
    </main>
  );
}