import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const citySlug = searchParams.get('city')?.trim() || undefined;
    const provinceSlug = searchParams.get('province')?.trim() || undefined;
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

    const where: Prisma.TopicWhereInput = {
      status: 'APPROVED',
    };

    if (provinceSlug) {
      where.province = {
        slug: provinceSlug,
      };
    }

    if (citySlug) {
      where.city = {
        slug: citySlug,
      };
    }

    if (typeParam) {
      where.types = {
        some: {
          type: {
            label: typeParam,
          },
        },
      };
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
        {
          // Searching must consider all attached types, not just the primary.
          types: {
            some: {
              type: {
                label: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
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
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedTopics = topics.map((topic) => ({
      ...topic,
      types: topic.types.map((tag) => ({
        id: tag.id,
        label: tag.type.label,
        kind: tag.kind,
      })),
    }));

    return NextResponse.json({
      topics: mappedTopics,
      data: mappedTopics,
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