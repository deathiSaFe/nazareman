import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const collator = new Intl.Collator('fa', { sensitivity: 'base' });

export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    provinces.sort((a, b) => collator.compare(a.name, b.name));

    return NextResponse.json(provinces);
  } catch (error) {
    console.error('Failed to fetch provinces:', error);

    return NextResponse.json(
      { error: 'Failed to fetch provinces' },
      { status: 500 }
    );
  }
}