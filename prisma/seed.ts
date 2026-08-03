import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ProvinceSeed = {
  name: string;
  slug: string;
};

type CitySeed = {
  name: string;
  slug: string;
  provinceSlug: string;
  geonameId: number;
};

type LocationSeed = {
  metadata?: {
    source?: string;
    license?: string;
    generatedAt?: string;
  };
  provinces: ProvinceSeed[];
  cities: CitySeed[];
};

function chunk<T>(input: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < input.length; i += size) {
    result.push(input.slice(i, i + size));
  }

  return result;
}

async function readSeedData(): Promise<LocationSeed> {
  const seedFilePath = path.join(
    process.cwd(),
    'prisma',
    'seed-data',
    'iran-locations.json'
  );

  try {
    const fileContents = await fs.readFile(seedFilePath, 'utf8');
    return JSON.parse(fileContents) as LocationSeed;
  } catch (error) {
    throw new Error(
      `Failed to read seed data at ${seedFilePath}. ` +
        `Make sure prisma/seed-data/iran-locations.json exists.\n` +
        String(error)
    );
  }
}

function validateSeedData(data: LocationSeed): void {
  if (!Array.isArray(data.provinces)) {
    throw new Error('Seed data is invalid: provinces must be an array.');
  }

  if (!Array.isArray(data.cities)) {
    throw new Error('Seed data is invalid: cities must be an array.');
  }

  if (data.provinces.length !== 31) {
    throw new Error(
      `Seed data is invalid: expected exactly 31 provinces, received ${data.provinces.length}.`
    );
  }

  if (data.cities.length === 0) {
    throw new Error('Seed data is invalid: cities array is empty.');
  }

  const provinceSlugs = new Set<string>();

  for (const province of data.provinces) {
    if (typeof province.name !== 'string' || province.name.trim() === '') {
      throw new Error('Seed data is invalid: province name is missing.');
    }

    if (typeof province.slug !== 'string' || province.slug.trim() === '') {
      throw new Error('Seed data is invalid: province slug is missing.');
    }

    if (provinceSlugs.has(province.slug)) {
      throw new Error(
        `Seed data is invalid: duplicate province slug "${province.slug}".`
      );
    }

    provinceSlugs.add(province.slug);
  }

  const citySlugKeys = new Set<string>();
  const cityNameKeys = new Set<string>();

  for (const city of data.cities) {
    if (typeof city.name !== 'string' || city.name.trim() === '') {
      throw new Error('Seed data is invalid: city name is missing.');
    }

    if (typeof city.slug !== 'string' || city.slug.trim() === '') {
      throw new Error('Seed data is invalid: city slug is missing.');
    }

    if (typeof city.provinceSlug !== 'string' || city.provinceSlug.trim() === '') {
      throw new Error('Seed data is invalid: city provinceSlug is missing.');
    }

    if (!Number.isInteger(city.geonameId)) {
      throw new Error(
        `Seed data is invalid: city "${city.name}" has invalid geonameId.`
      );
    }

    if (!provinceSlugs.has(city.provinceSlug)) {
      throw new Error(
        `Seed data is invalid: city "${city.name}" references missing provinceSlug "${city.provinceSlug}".`
      );
    }

    const slugKey = `${city.provinceSlug}::${city.slug}`;
    const nameKey = `${city.provinceSlug}::${city.name}`;

    if (citySlugKeys.has(slugKey)) {
      throw new Error(
        `Seed data is invalid: duplicate city slug in province: ${slugKey}`
      );
    }

    if (cityNameKeys.has(nameKey)) {
      throw new Error(
        `Seed data is invalid: duplicate city name in province: ${nameKey}`
      );
    }

    citySlugKeys.add(slugKey);
    cityNameKeys.add(nameKey);
  }
}

async function printCounts(): Promise<void> {
  const provinceCount = await prisma.province.count();
  const cityCount = await prisma.city.count();

  console.log(`Province count: ${provinceCount}`);
  console.log(`City count: ${cityCount}`);
}

async function seedProvinces(provinces: ProvinceSeed[]): Promise<Map<string, string>> {
  console.log(`Seeding ${provinces.length} provinces...`);

  const provinceRecords = await prisma.$transaction(
    provinces.map((province) =>
      prisma.province.upsert({
        where: { slug: province.slug },
        update: { name: province.name },
        create: {
          name: province.name,
          slug: province.slug,
        },
        select: {
          id: true,
          slug: true,
        },
      })
    )
  );

  const provinceSlugToId = new Map<string, string>();

  for (const province of provinceRecords) {
    provinceSlugToId.set(province.slug, province.id);
  }

  return provinceSlugToId;
}

async function seedCities(
  cities: CitySeed[],
  provinceSlugToId: Map<string, string>
): Promise<void> {
  console.log(`Seeding ${cities.length} cities...`);

  const cityOperations = cities.map((city) => {
    const provinceId = provinceSlugToId.get(city.provinceSlug);

    if (!provinceId) {
      throw new Error(
        `City "${city.name}" references missing provinceSlug "${city.provinceSlug}".`
      );
    }

    return prisma.city.upsert({
      where: {
        provinceId_slug: {
          provinceId,
          slug: city.slug,
        },
      },
      update: {
        name: city.name,
      },
      create: {
        name: city.name,
        slug: city.slug,
        provinceId,
      },
      select: {
        id: true,
      },
    });
  });

  const cityOperationChunks = chunk(cityOperations, 100);

  for (
    let chunkIndex = 0;
    chunkIndex < cityOperationChunks.length;
    chunkIndex += 1
  ) {
    const cityOperationChunk = cityOperationChunks[chunkIndex];

    console.log(
      `Seeding city chunk ${chunkIndex + 1}/${cityOperationChunks.length}...`
    );

    await prisma.$transaction(cityOperationChunk);
  }
}

async function main(): Promise<void> {
  const countOnly = process.argv.includes('--count-only');

  if (countOnly) {
    await printCounts();
    return;
  }

  const seedData = await readSeedData();

  validateSeedData(seedData);

  const provinceSlugToId = await seedProvinces(seedData.provinces);

  await seedCities(seedData.cities, provinceSlugToId);

  console.log('Seed completed.');
  await printCounts();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });