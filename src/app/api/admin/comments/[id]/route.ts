import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminPassword } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_STATUSES = ['APPROVED', 'REJECTED'] as const;

const MAX_BODY_LENGTH = 2000;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function readAdminPassword(request: NextRequest): string {
  const raw = request.headers.get('x-admin-password') ?? '';

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return (
    typeof value === 'string' &&
    (ALLOWED_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * PATCH /api/admin/comments/[id]
 * Moderate a single comment from inside the page review: change its status
 * (approve/reject) and/or edit its body.
 */
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  // Authorization is validated BEFORE any mutation.
  const adminPassword = readAdminPassword(request);

  if (!validateAdminPassword(adminPassword)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 }
    );
  }

  const data = payload as Record<string, unknown>;
  const rawBody = typeof data.body === 'string' ? data.body.trim() : undefined;

  const errors: string[] = [];

  let status: AllowedStatus | undefined;
  if (data.status !== undefined) {
    if (isAllowedStatus(data.status)) {
      status = data.status;
    } else {
      errors.push('status must be APPROVED or REJECTED.');
    }
  }

  if (rawBody !== undefined && rawBody.length === 0) {
    errors.push('body must not be empty.');
  } else if (rawBody !== undefined && rawBody.length > MAX_BODY_LENGTH) {
    errors.push(`body must be ${MAX_BODY_LENGTH} characters or fewer.`);
  }

  if (status === undefined && rawBody === undefined) {
    errors.push('Provide a status or a body to update.');
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Invalid input.', details: errors }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const identifier = id.trim();

    if (!identifier || !UUID_REGEX.test(identifier)) {
      return NextResponse.json(
        { error: 'Comment not found.' },
        { status: 404 }
      );
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: identifier },
      select: { id: true },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found.' },
        { status: 404 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: existingComment.id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(rawBody !== undefined ? { body: rawBody } : {}),
      },
      select: {
        id: true,
        body: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Failed to update comment:', error);

    return NextResponse.json(
      { error: 'Failed to update comment.' },
      { status: 500 }
    );
  }
}
