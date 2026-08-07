import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEARCH_MIN_SCORE, searchScore, type TopicForSearch } from '@/lib/topic-search';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * Upper bound on how many topics are pulled into memory for relevance scoring
 * when a `search` term is present. Practical for the current dataset — in-memory
 * scoring needs to see the full candidate window because SQL `contains` cannot
 * see Arabic/Persian glyph variants (ك/ک, ي/ی). Revisit when the dataset grows.
 */
const SEARCH_CANDIDATE_LIMIT = 500;

const topicSelect = {
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
} satisfies Prisma.TopicSelect;

type SearchableTopic = Prisma.TopicGetPayload<{ select: typeof topicSelect }>;

function mapTopic(topic: SearchableTopic) {
  return {
    ...topic,
    types: topic.types.map((tag) => ({
      id: tag.id,
      label: tag.type.label,
      kind: tag.kind,
    })),
  };
}

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

    const skip = (page - 1) * limit;

    if (searchTerm) {
      // Relevance search: pull a bounded, most-recent candidate window and
      // rank it in memory. The province/city/type filters above still apply at
      // the query level, so an explicit type or location filter is preserved.
      const candidates = await prisma.topic.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: SEARCH_CANDIDATE_LIMIT,
        select: topicSelect,
      });

      const scored = candidates
        .map((topic) => {
          const match: TopicForSearch = {
            name: topic.name,
            description: topic.description,
            types: topic.types.map((tag) => tag.type.label),
          };

          return { topic, score: searchScore(searchTerm, match) };
        })
        .filter(({ score }) => score >= SEARCH_MIN_SCORE)
        .sort(
          (a, b) =>
            b.score - a.score ||
            b.topic.createdAt.getTime() - a.topic.createdAt.getTime()
        );

      const total = scored.length;
      const totalPages = Math.ceil(total / limit);

      const mappedTopics = scored
        .slice(skip, skip + limit)
        .map(({ topic }) => mapTopic(topic));

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
    }

    const [total, topics] = await Promise.all([
      prisma.topic.count({ where }),
      prisma.topic.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: topicSelect,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedTopics = topics.map(mapTopic);

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