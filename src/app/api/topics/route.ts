import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma, TopicType } from '@prisma/client';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const citySlug = searchParams.get('city')?.trim() || undefined;
    const typeParam = searchParams.get('type')?.trim() || undefined;
    const searchTerm = searchParams.get('search')?.trim() || undefined;
    const pageParam = searchParams.get('page')?.trim();
    const limitParam = searchParams.get('limit')?.trim();

    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 20;

    if (!Number.isInteger(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page. page must be a positive integer.' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit. limit must be a positive integer.' },
        { status: 400 }
      );
    }

    let type: TopicType | undefined;

    if (typeParam) {
      if (!isTopicType(typeParam)) {
        return NextResponse.json(
          { error: 'Invalid topic type.' },
          { status: 400 }
        );
      }

      type = typeParam;
    }

    const where: Prisma.TopicWhereInput = {
      status: 'APPROVED',
    };

    if (citySlug) {
      where.city = {
        slug: citySlug,
      };
    }

    if (type) {
      where.type = type;
    }

    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, topics] = await Promise.all([
      prisma.topic.count({ where }),
      prisma.topic.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          description: true,
          imageUrl: true,
          createdAt: true,
          city: {
            select: {
              id: true,
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
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: topics,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to fetch topics:', error);

    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}