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

    const topic = await prisma.topic.findFirst({
      where: {
        status: 'APPROVED',
        OR: isUuid
          ? [{ id: identifier }, { slug: identifier }]
          : [{ slug: identifier }],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        description: true,
        imageUrl: true,
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
        comments: {
          where: {
            status: 'APPROVED',
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            body: true,
            createdAt: true,
            author: {
              select: {
                displayName: true,
              },
            },
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

    const comments = topic.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      authorName: comment.author?.displayName ?? null,
    }));

    return NextResponse.json({
      id: topic.id,
      slug: topic.slug,
      name: topic.name,
      type: topic.type,
      description: topic.description,
      imageUrl: topic.imageUrl,
      city: topic.city,
      comments,
    });
  } catch (error) {
    console.error('Failed to fetch topic:', error);

    return NextResponse.json(
      { error: 'Failed to fetch topic.' },
      { status: 500 }
    );
  }
}