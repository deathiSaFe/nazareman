import TopicPageClient from '@/components/topic/TopicPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'موضوع - نظرمن',
};

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TopicPageClient topicId={id} />;
}