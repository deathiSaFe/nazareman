import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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
  const body = typeof data.body === 'string' ? data.body.trim() : '';

  if (!body) {
    return NextResponse.json(
      { error: 'متن نظر الزامی است.' },
      { status: 400 }
    );
  }

  if (body.length < 5) {
    return NextResponse.json(
      { error: 'متن نظر باید حداقل ۵ حرف باشد.' },
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

    // Allow comments on PENDING topics when accessed by UUID (creator flow).
    // Slug-based access only allows APPROVED topics (public flow).
    const allowedStatuses: Array<'APPROVED' | 'PENDING'> = isUuid
      ? ['APPROVED', 'PENDING']
      : ['APPROVED'];

    const topic = await prisma.topic.findFirst({
      where: {
        status: { in: allowedStatuses },
        OR: isUuid
          ? [{ id: identifier }, { slug: identifier }]
          : [{ slug: identifier }],
      },
      select: {
        id: true,
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found.' },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        topicId: topic.id,
        body,
        status: 'PENDING',
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        commentId: comment.id,
        message: 'نظر شما برای بررسی ارسال شد.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to submit comment:', error);

    return NextResponse.json(
      { error: 'Failed to submit comment.' },
      { status: 500 }
    );
  }
}