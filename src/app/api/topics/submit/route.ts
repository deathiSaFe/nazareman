import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import type { TopicType } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOPIC_TYPES: readonly TopicType[] = [
  'person', 'business', 'place', 'product', 'education', 'medical', 'organization', 'other',
];

const LOCATION_BASED_TYPES: readonly TopicType[] = [
  'person', 'business', 'place', 'education', 'medical', 'organization',
];

function isTopicType(value: string): value is TopicType {
  return (TOPIC_TYPES as readonly string[]).includes(value);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function slugifyName(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');

  return slug || 'topic';
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const typeParam = typeof data.type === 'string' ? data.type.trim().toLowerCase() : '';
  const description = typeof data.description === 'string' ? data.description.trim() : '';
  
  const citySlug = typeof data.citySlug === 'string' ? data.citySlug.trim().toLowerCase() : '';
  const cityName = typeof data.cityName === 'string' ? data.cityName.trim() : '';

  if (!name) errors.push('name is required.');
  if (!typeParam || !isTopicType(typeParam)) errors.push('type must be a valid topic type.');
  if (!description) errors.push('description is required.');
  else if (description.length < 20) errors.push('description must be at least 20 characters long.');

  let imageUrl: string | undefined;
  if (typeof data.imageUrl === 'string' && data.imageUrl.trim()) {
    if (!isValidHttpUrl(data.imageUrl.trim())) errors.push('imageUrl must be a valid URL.');
    else imageUrl = data.imageUrl.trim();
  }

  let firstComment: string | undefined;
  if (typeof data.firstComment === 'string' && data.firstComment.trim()) {
    firstComment = data.firstComment.trim();
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Invalid input.', details: errors }, { status: 400 });
  }

  const topicType = typeParam as TopicType;
  const isLocationBased = LOCATION_BASED_TYPES.includes(topicType);

  try {
    let city = null;

    if (citySlug) {
      city = await prisma.city.findFirst({ where: { slug: citySlug }, select: { id: true } });
    } 
    
    if (!city && cityName) {
      city = await prisma.city.findFirst({ where: { name: cityName }, select: { id: true } });
    }

    if (!city && isLocationBased) {
      // Fallback for testing: if location is required but missing/invalid, default to Tehran
      city = await prisma.city.findFirst({ where: { slug: 'tehran' }, select: { id: true } });
    }

    if (!city && isLocationBased) {
      return NextResponse.json({ error: 'City not found and no default city available.' }, { status: 404 });
    }

    const createdTopic = await prisma.$transaction(async (tx) => {
      const baseSlug = slugifyName(name);
      let slug = `${baseSlug}-${randomUUID().replace(/-/g, '').slice(0, 12)}`;

      const topic = await tx.topic.create({
        data: {
          slug,
          name,
          type: topicType,
          description,
          imageUrl,
          cityId: city?.id || null,
          status: 'PENDING',
        },
        select: { id: true, slug: true },
      });

      await tx.submission.create({
        data: { topicId: topic.id, status: 'PENDING' },
      });

      if (firstComment) {
        await tx.comment.create({
          data: {
            topicId: topic.id,
            body: firstComment,
            status: 'PENDING',
          },
        });
      }

      return topic;
    });

    return NextResponse.json({
      success: true,
      topicId: createdTopic.id,
      slug: createdTopic.slug,
      message: 'Topic submitted for review',
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit topic:', error);
    return NextResponse.json({ error: 'Failed to submit topic.' }, { status: 500 });
  }
}