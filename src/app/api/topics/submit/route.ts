import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import type { TopicType } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOPIC_TYPES: readonly TopicType[] = [
  'person',
  'business',
  'place',
  'product',
  'education',
  'medical',
  'organization',
  'other',
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
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  const name =
    typeof data.name === 'string' ? data.name.trim() : '';

  const typeParam =
    typeof data.type === 'string'
      ? data.type.trim().toLowerCase()
      : '';

  const description =
    typeof data.description === 'string'
      ? data.description.trim()
      : '';

  const citySlug =
    typeof data.citySlug === 'string'
      ? data.citySlug.trim().toLowerCase()
      : '';

  let imageUrl: string | undefined;
  let firstComment: string | undefined;

  if (!name) {
    errors.push('name is required.');
  }

  if (!typeParam) {
    errors.push('type is required.');
  } else if (!isTopicType(typeParam)) {
    errors.push('type must be a valid topic type.');
  }

  if (!description) {
    errors.push('description is required.');
  } else if (description.length < 20) {
    errors.push('description must be at least 20 characters long.');
  }

  if (!citySlug) {
    errors.push('citySlug is required.');
  }

  if (data.imageUrl !== undefined && data.imageUrl !== null) {
    if (typeof data.imageUrl !== 'string') {
      errors.push('imageUrl must be a string.');
    } else {
      const trimmedImageUrl = data.imageUrl.trim();

      if (trimmedImageUrl) {
        if (!isValidHttpUrl(trimmedImageUrl)) {
          errors.push('imageUrl must be a valid URL.');
        } else {
          imageUrl = trimmedImageUrl;
        }
      }
    }
  }

  if (data.firstComment !== undefined && data.firstComment !== null) {
    if (typeof data.firstComment !== 'string') {
      errors.push('firstComment must be a string.');
    } else {
      const trimmedFirstComment = data.firstComment.trim();

      if (trimmedFirstComment) {
        firstComment = trimmedFirstComment;
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Invalid input.',
        details: errors,
      },
      { status: 400 }
    );
  }

  const topicType: TopicType | undefined = isTopicType(typeParam)
    ? typeParam
    : undefined;

  if (!topicType) {
    return NextResponse.json(
      {
        error: 'Invalid input.',
        details: ['type must be valid.'],
      },
      { status: 400 }
    );
  }

  try {
    const city = await prisma.city.findFirst({
      where: {
        slug: citySlug,
      },
      select: {
        id: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found.' },
        { status: 404 }
      );
    }

    const createdTopic = await prisma.$transaction(
      async (tx) => {
        const baseSlug = slugifyName(name);
        let slug = '';

        for (let attempt = 0; attempt < 5; attempt++) {
          const candidateSlug = `${baseSlug}-${randomUUID()
            .replace(/-/g, '')
            .slice(0, 12)}`;

          const existing = await tx.topic.findUnique({
            where: {
              slug: candidateSlug,
            },
            select: {
              id: true,
            },
          });

          if (!existing) {
            slug = candidateSlug;
            break;
          }
        }

        if (!slug) {
          slug = `${baseSlug}-${randomUUID()}`;
        }

        const topic = await tx.topic.create({
          data: {
            slug,
            name,
            type: topicType,
            description,
            imageUrl,
            cityId: city.id,
            status: 'PENDING',
          },
          select: {
            id: true,
          },
        });

        const submission = await tx.submission.create({
          data: {
            topicId: topic.id,
            status: 'PENDING',
          },
          select: {
            id: true,
          },
        });

        if (firstComment) {
          await tx.comment.create({
            data: {
              topicId: topic.id,
              submissionId: submission.id,
              body: firstComment,
              status: 'PENDING',
            },
            select: {
              id: true,
            },
          });
        }

        return topic;
      },
      {
        timeout: 30000,
      }
    );

    return NextResponse.json(
      {
        success: true,
        topicId: createdTopic.id,
        message: 'Topic submitted for review.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to submit topic', error);

    return NextResponse.json(
      { error: 'Failed to submit topic.' },
      { status: 500 }
    );
  }
}