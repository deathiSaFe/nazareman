import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminPassword } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_STATUSES = ['APPROVED', 'REJECTED'] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return (
    typeof value === 'string' &&
    (ALLOWED_STATUSES as readonly string[]).includes(value)
  );
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const rawAdminPassword = request.headers.get('x-admin-password') ?? '';

  let adminPassword = rawAdminPassword;

  try {
    adminPassword = decodeURIComponent(rawAdminPassword);
  } catch {
    adminPassword = rawAdminPassword;
  }

  if (!validateAdminPassword(adminPassword)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const data = payload as Record<string, unknown>;
  const status = data.status;

  if (!isAllowedStatus(status)) {
    return NextResponse.json(
      { error: 'status must be APPROVED or REJECTED.' },
      { status: 400 }
    );
  }

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

    const existingTopic = await prisma.topic.findFirst({
      where: {
        OR: isUuid
          ? [{ id: identifier }, { slug: identifier }]
          : [{ slug: identifier }],
      },
      select: {
        id: true,
      },
    });

    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Topic not found.' },
        { status: 404 }
      );
    }

    const updatedTopic = await prisma.$transaction(async (tx) => {
      const topic = await tx.topic.update({
        where: {
          id: existingTopic.id,
        },
        data: {
          status,
          approvedAt: status === 'APPROVED' ? new Date() : null,
        },
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          status: true,
          approvedAt: true,
        },
      });

      await tx.submission.updateMany({
        where: {
          topicId: existingTopic.id,
        },
        data: {
          status,
          decidedAt: new Date(),
        },
      });

      return topic;
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error('Failed to update topic moderation status:', error);

    return NextResponse.json(
      { error: 'Failed to update topic moderation status.' },
      { status: 500 }
    );
  }
}