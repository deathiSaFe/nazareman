import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ContactPlatform } from '@/types/topic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_WORKING_HOURS_LENGTH = 500;
const MAX_LINK_LENGTH = 200;
const MAX_LINK_LABEL_LENGTH = 40;
const MAX_ADDRESS_LENGTH = 200;

const PLATFORMS: readonly ContactPlatform[] = [
  'INSTAGRAM',
  'TELEGRAM',
  'WHATSAPP',
  'BALE',
  'EITAA',
  'RUBIKA',
  'LINKEDIN',
  'X',
  'YOUTUBE',
  'FACEBOOK',
  'WEBSITE',
  'OTHER',
  'PHONE',
];

function isPlatform(value: unknown): value is ContactPlatform {
  return (
    typeof value === 'string' &&
    (PLATFORMS as readonly string[]).includes(value)
  );
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

type SubmittedLink = { platform: ContactPlatform; label?: string; value: string };

function parseLinks(raw: unknown, errors: string[]): SubmittedLink[] {
  if (raw === undefined) return [];

  if (!Array.isArray(raw)) {
    errors.push('links must be an array.');
    return [];
  }

  const links: SubmittedLink[] = [];

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) {
      errors.push('Each link must be an object with platform and value.');
      continue;
    }

    const record = item as Record<string, unknown>;
    const platform = record.platform;
    const value = typeof record.value === 'string' ? record.value.trim() : '';
    const label = typeof record.label === 'string' ? record.label.trim() : '';

    if (!isPlatform(platform)) {
      errors.push('link platform is invalid.');
      continue;
    }

    if (!value) {
      errors.push('link value is required.');
      continue;
    }

    if (value.length > MAX_LINK_LENGTH) {
      errors.push(`link value must be ${MAX_LINK_LENGTH} characters or fewer.`);
      continue;
    }

    if (label.length > MAX_LINK_LABEL_LENGTH) {
      errors.push(`link label must be ${MAX_LINK_LABEL_LENGTH} characters or fewer.`);
      continue;
    }

    links.push({ platform, ...(label ? { label } : {}), value });
  }

  return links;
}

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const identifier = id.trim();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Topic not found.' },
        { status: 404 }
      );
    }

    const isUuid = UUID_REGEX.test(identifier);

    const allowedStatuses: Array<'APPROVED' | 'PENDING'> = isUuid
      ? ['APPROVED', 'PENDING']
      : ['APPROVED'];

    // Fetch topic first (without comments) to determine its status
    const topic = await prisma.topic.findFirst({
      where: {
        status: { in: allowedStatuses },
        OR: isUuid
          ? [{ id: identifier }, { slug: identifier }]
          : [{ slug: identifier }],
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
        links: {
          select: {
            id: true,
            platform: true,
            label: true,
            value: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
            province: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        province: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        types: {
          select: {
            id: true,
            kind: true,
            type: {
              select: {
                label: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found.' },
        { status: 404 }
      );
    }

    // If topic is PENDING (creator viewing via UUID), show all comments.
    // If topic is APPROVED (public view), only show APPROVED comments.
    const commentStatusFilter =
      topic.status === 'PENDING'
        ? undefined
        : 'APPROVED';

    const comments = await prisma.comment.findMany({
      where: {
        topicId: topic.id,
        ...(commentStatusFilter
          ? { status: commentStatusFilter }
          : {}),
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        status: true,
        author: {
          select: {
            displayName: true,
          },
        },
      },
    });

    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      status: comment.status,
      authorName: comment.author?.displayName ?? null,
    }));

    return NextResponse.json({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      description: topic.description,
      workingHours: topic.workingHours,
      imageUrl: topic.imageUrl,
      scope: topic.scope,
      address: topic.address,
      status: topic.status,
      city: topic.city,
      province: topic.province,
      types: topic.types.map((tag) => ({
        id: tag.id,
        label: tag.type.label,
        kind: tag.kind,
      })),
      links: topic.links.map((link) => ({
        id: link.id,
        platform: link.platform,
        label: link.label,
        value: link.value,
      })),
      comments: mappedComments,
    });
  } catch (error) {
    console.error('Failed to fetch topic:', error);

    return NextResponse.json(
      { error: 'Failed to fetch topic.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/topics/[id]
 * Inline page editors call this endpoint. Accepts any subset of the
 * contribution fields: introduction, working hours, primary image, address and
 * the repeatable contact rows (phones / website / social links).
 *
 * FUTURE OWNERSHIP: this endpoint currently lets any visitor edit a page.
 * Once ownership is introduced, gate it behind the page's Creator/Owner.
 */
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  const text = (key: string): string =>
    typeof data[key] === 'string' ? (data[key] as string).trim() : '';

  const description = text('description');
  const workingHours = text('workingHours');
  const address = text('address');
  const imageUrl = text('imageUrl');

  const hasLinks = data.links !== undefined;
  const links = hasLinks ? parseLinks(data.links, errors) : [];

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
  }
  if (workingHours.length > MAX_WORKING_HOURS_LENGTH) {
    errors.push(`workingHours must be ${MAX_WORKING_HOURS_LENGTH} characters or fewer.`);
  }
  if (address.length > MAX_ADDRESS_LENGTH) {
    errors.push(`address must be ${MAX_ADDRESS_LENGTH} characters or fewer.`);
  }
  if (imageUrl && !isValidHttpUrl(imageUrl)) {
    errors.push('imageUrl must be a valid http(s) URL.');
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Invalid input.', details: errors }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const identifier = id.trim();

    if (!identifier) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const isUuid = UUID_REGEX.test(identifier);

    const existing = await prisma.topic.findFirst({
      where: {
        status: { in: ['APPROVED', 'PENDING'] },
        OR: isUuid
          ? [{ id: identifier }, { slug: identifier }]
          : [{ slug: identifier }],
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const topic = await tx.topic.update({
        where: { id: existing.id },
        data: {
          description: description || null,
          workingHours: workingHours || null,
          address: address || null,
          imageUrl: imageUrl || null,
        },
        select: { id: true, slug: true },
      });

      if (hasLinks) {
        await tx.topicLink.deleteMany({ where: { topicId: existing.id } });

        for (const link of links) {
          await tx.topicLink.create({
            data: {
              topicId: existing.id,
              platform: link.platform,
              label: link.label ?? null,
              value: link.value,
            },
          });
        }
      }

      return topic;
    });

    return NextResponse.json({ success: true, topic: updated });
  } catch (error) {
    console.error('Failed to update page:', error);

    return NextResponse.json(
      { error: 'Failed to update page.' },
      { status: 500 }
    );
  }
}