import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const collator = new Intl.Collator('fa', { sensitivity: 'base' });

export async function GET(request: NextRequest) {
  try {
    const provinceSlug = request.nextUrl.searchParams
      .get('province')
      ?.trim();

    if (!provinceSlug) {
      return NextResponse.json(
        { error: 'province query parameter is required' },
        { status: 400 }
      );
    }

    const province = await prisma.province.findUnique({
      where: { slug: provinceSlug },
      select: { id: true },
    });

    if (!province) {
      return NextResponse.json(
        { error: 'Province not found' },
        { status: 404 }
      );
    }

    const cities = await prisma.city.findMany({
      where: {
        provinceId: province.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    cities.sort((a, b) => collator.compare(a.name, b.name));

    return NextResponse.json(cities);
  } catch (error) {
    console.error('Failed to fetch cities:', error);

    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}