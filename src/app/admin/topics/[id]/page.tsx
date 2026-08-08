import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageView } from '@/components/page/PageView';
import { AdminLoginForm } from '@/components/admin/AdminLoginForm';
import {
  getAdminPassword,
  validateAdminPassword,
  getAdminPasswordFromCookie,
} from '@/lib/admin-auth';
import type { PageData } from '@/types/topic';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'بررسی صفحه - نظرمن',
};

export default async function AdminPageReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const identifier = id.trim();

  const page = await prisma.topic.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      workingHours: true,
      imageUrl: true,
      scope: true,
      address: true,
      status: true,
      province: {
        select: { id: true, name: true, slug: true },
      },
      city: {
        select: { id: true, name: true, slug: true },
      },
      types: {
        select: {
          id: true,
          kind: true,
          order: true,
          typeId: true,
          type: {
            select: { label: true, status: true },
          },
        },
        orderBy: { order: 'asc' },
      },
      links: {
        select: { id: true, platform: true, label: true, value: true },
        orderBy: { createdAt: 'asc' },
      },
      comments: {
        select: {
          id: true,
          body: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
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

  if (!page) {
    notFound();
  }

  const data: PageData = {
    id: page.id,
    slug: page.slug,
    name: page.name,
    description: page.description,
    workingHours: page.workingHours,
    imageUrl: page.imageUrl,
    address: page.address,
    scope: page.scope,
    status: page.status,
    province: page.province
      ? { id: page.province.id, name: page.province.name, slug: page.province.slug }
      : null,
    city: page.city
      ? { id: page.city.id, name: page.city.name, slug: page.city.slug }
      : null,
    types: page.types.map((tag) => ({
      id: tag.id,
      label: tag.type.label,
      kind: tag.kind,
      suggestionId: tag.typeId,
      suggestionStatus: tag.type.status,
    })),
    links: page.links.map((link) => ({
      id: link.id,
      platform: link.platform,
      label: link.label,
      value: link.value,
    })),
    comments: page.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      status: comment.status,
      createdAt: comment.createdAt.toISOString(),
    })),
  };

  return (
    <main className="min-h-screen bg-paper pb-16">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/topics"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-turquoise-700 transition-colors hover:bg-turquoise-600/10"
          >
            بازگشت به فهرست
          </Link>

          <a
            href={`/topic/${page.slug ?? page.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-ink-500 underline underline-offset-4 transition-colors hover:text-turquoise-700"
          >
            مشاهده عمومی صفحه
          </a>
        </div>

        <header className="mt-6">
          <h1 className="font-display text-3xl text-ink-900">بررسی صفحه</h1>

          <p className="mt-2 text-sm leading-6 text-ink-600">
            همین صفحه را ویرایش و منتشر کنید؛ همه بخش‌ها قابل ویرایش‌اند و نظرات از
            همین‌جا مدیریت می‌شوند.
          </p>
        </header>

        <div className="mt-6">
          <PageView page={data} admin />
        </div>
      </div>
    </main>
  );
}
