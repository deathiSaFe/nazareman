import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
        imageUrl: true,
        status: true,
        city: {
          select: {
            name: true,
            slug: true,
            province: {
              select: {
                name: true,
                slug: true,
              },
            },
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
      imageUrl: topic.imageUrl,
      status: topic.status,
      city: topic.city,
      types: topic.types.map((tag) => ({
        id: tag.id,
        label: tag.type.label,
        kind: tag.kind,
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