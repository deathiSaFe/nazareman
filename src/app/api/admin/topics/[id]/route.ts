import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminPassword } from '@/lib/admin-auth';
import type { ContactPlatform, LocationScope, TopicTypeKind } from '@/types/topic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_STATUSES = ['APPROVED', 'REJECTED'] as const;

const LOCATION_SCOPES: readonly LocationScope[] = ['NATIONAL', 'PROVINCE', 'CITY', 'ADDRESS'];

const MAX_NAME_LENGTH = 80;
const MAX_TYPE_LENGTH = 60;
const MAX_TYPES = 5;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_PHONE_LENGTH = 30;
const MAX_LINK_LENGTH = 200;
const MAX_ADDRESS_LENGTH = 200;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

type SubmittedType = {
  label: string;
  kind: TopicTypeKind;
};

type SubmittedLink = {
  platform: ContactPlatform;
  value: string;
};

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

function isLocationScope(value: unknown): value is LocationScope {
  return (
    typeof value === 'string' &&
    (LOCATION_SCOPES as readonly string[]).includes(value)
  );
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseTypes(raw: unknown): SubmittedType[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const types: SubmittedType[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;

    const record = item as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.trim() : '';
    const kind = record.kind;

    if (!label || label.length > MAX_TYPE_LENGTH) continue;
    if (kind !== 'PRIMARY' && kind !== 'SECONDARY') continue;
    if (seen.has(label)) continue;

    seen.add(label);
    types.push({ label, kind });
  }

  if (types.length === 0) return [];

  const primaryIndex = types.findIndex((type) => type.kind === 'PRIMARY');

  if (primaryIndex > 0) {
    return [];
  }

  if (primaryIndex === -1) {
    types[0].kind = 'PRIMARY';
  }

  return types;
}

function parseLinks(raw: unknown): SubmittedLink[] | null {
  if (raw === undefined) return null;

  if (!Array.isArray(raw)) return [];

  const links: SubmittedLink[] = [];

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;

    const record = item as Record<string, unknown>;
    const platform = record.platform;
    const value = typeof record.value === 'string' ? record.value.trim() : '';

    if (typeof platform !== 'string') continue;
    if (
      ![
        'INSTAGRAM',
        'TELEGRAM',
        'WHATSAPP',
        'BALE',
        'EITAA',
        'RUBIKA',
        'LINKEDIN',
        'X',
        'YOUTUBE',
        'FACEBOOK',
        'WEBSITE',
        'OTHER',
      ].includes(platform)
    ) {
      continue;
    }

    if (!value || value.length > MAX_LINK_LENGTH) continue;

    links.push({ platform: platform as ContactPlatform, value });
  }

  return links;
}

/**
 * PATCH /api/admin/topics/[id]
 * Full page review: the admin can edit every field and publish/reject the
 * page in one action. Types are replaced atomically via TopicTypeTag.
 */
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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
  const errors: string[] = [];

  // Partial update: only the fields that are present in the body are changed.
  const has = (key: string): boolean => data[key] !== undefined;

  const name = typeof data.name === 'string' ? data.name.trim() : undefined;
  const provinceSlug =
    typeof data.provinceSlug === 'string' ? data.provinceSlug.trim() : '';
  const citySlug = typeof data.citySlug === 'string' ? data.citySlug.trim() : '';
  const address = has('address')
    ? typeof data.address === 'string'
      ? data.address.trim()
      : ''
    : undefined;
  const description = has('description')
    ? typeof data.description === 'string'
      ? data.description.trim()
      : ''
    : undefined;
  const phone = has('phone')
    ? typeof data.phone === 'string'
      ? data.phone.trim()
      : ''
    : undefined;
  const imageUrl = has('imageUrl')
    ? typeof data.imageUrl === 'string'
      ? data.imageUrl.trim()
      : ''
    : undefined;

  const scope = data.scope;
  const locationScope = isLocationScope(scope) ? scope : 'NATIONAL';

  let status: AllowedStatus | undefined;
  if (data.status !== undefined) {
    if (isAllowedStatus(data.status)) {
      status = data.status;
    } else {
      errors.push('status must be APPROVED or REJECTED.');
    }
  }

  const types = has('types') ? parseTypes(data.types) : null;
  const links = parseLinks(data.links);

  if (has('name')) {
    if (!name) errors.push('name is required.');
    else if (name.length > MAX_NAME_LENGTH) {
      errors.push(`name must be ${MAX_NAME_LENGTH} characters or fewer.`);
    }
  }

  if (has('types')) {
    if (!types || types.length === 0) {
      errors.push('types must contain at least one valid type.');
    } else if (types.length > MAX_TYPES) {
      errors.push(`types must contain at most ${MAX_TYPES} types.`);
    }
  }

  if (has('scope')) {
    if (!isLocationScope(scope)) {
      errors.push('scope must be a valid location scope.');
    } else if (
      (locationScope === 'PROVINCE' ||
        locationScope === 'CITY' ||
        locationScope === 'ADDRESS') &&
      !provinceSlug
    ) {
      errors.push('provinceSlug is required for this scope.');
    } else if (
      (locationScope === 'CITY' || locationScope === 'ADDRESS') &&
      !citySlug
    ) {
      errors.push('citySlug is required for city or address scope.');
    }
  }

  if (address !== undefined && address.length > MAX_ADDRESS_LENGTH) {
    errors.push(`address must be ${MAX_ADDRESS_LENGTH} characters or fewer.`);
  }
  if (description !== undefined && description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
  }
  if (phone !== undefined && phone.length > MAX_PHONE_LENGTH) {
    errors.push(`phone must be ${MAX_PHONE_LENGTH} characters or fewer.`);
  }
  if (imageUrl !== undefined && imageUrl && !isValidHttpUrl(imageUrl)) {
    errors.push('imageUrl must be a valid http(s) URL.');
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: 'Invalid input.', details: errors }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const identifier = id.trim();

    if (!identifier) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    const isUuid = UUID_REGEX.test(identifier);

    const existing = await prisma.topic.findFirst({
      where: {
        OR: isUuid
          ? [{ id: identifier }, { slug: identifier }]
          : [{ slug: identifier }],
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
    }

    let provinceId: string | null = null;
    let cityId: string | null = null;

    if (has('scope')) {
      if (
        locationScope === 'PROVINCE' ||
        locationScope === 'CITY' ||
        locationScope === 'ADDRESS'
      ) {
        const province = await prisma.province.findUnique({
          where: { slug: provinceSlug },
          select: { id: true },
        });

        if (!province) {
          return NextResponse.json({ error: 'Province not found.' }, { status: 404 });
        }

        provinceId = province.id;
      }

      if (locationScope === 'CITY' || locationScope === 'ADDRESS') {
        const city = await prisma.city.findUnique({
          where: { provinceId_slug: { provinceId: provinceId as string, slug: citySlug } },
          select: { id: true },
        });

        if (!city) {
          return NextResponse.json({ error: 'City not found.' }, { status: 404 });
        }

        cityId = city.id;
      }
    }

    const updatedTopic = await prisma.$transaction(async (tx) => {
      if (types !== null) {
        // Replace the page's types atomically.
        await tx.topicTypeTag.deleteMany({
          where: { topicId: existing.id },
        });

        for (let index = 0; index < types.length; index += 1) {
          const type = types[index];

          const suggestion = await tx.topicTypeSuggestion.upsert({
            where: { label: type.label },
            update: {},
            create: { label: type.label, status: 'PENDING' },
            select: { id: true },
          });

          await tx.topicTypeTag.create({
            data: {
              topicId: existing.id,
              typeId: suggestion.id,
              kind: type.kind,
              order: index,
            },
          });
        }
      }

      const updateData: Record<string, unknown> = {};

      if (has('name') && name) updateData.name = name;
      if (description !== undefined) updateData.description = description || null;
      if (phone !== undefined) updateData.phone = phone || null;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
      if (address !== undefined) updateData.address = address || null;

      if (has('scope')) {
        updateData.scope = locationScope;
        updateData.provinceId = provinceId;
        updateData.cityId = cityId;
      }

      if (status !== undefined) {
        updateData.status = status;
        updateData.approvedAt = status === 'APPROVED' ? new Date() : null;
      }

      const topic = await tx.topic.update({
        where: { id: existing.id },
        data: updateData,
        select: {
          id: true,
          slug: true,
          name: true,
          status: true,
          approvedAt: true,
        },
      });

      if (links !== null) {
        // Replace the page's contact/social links atomically.
        await tx.topicLink.deleteMany({ where: { topicId: existing.id } });

        for (const link of links) {
          await tx.topicLink.create({
            data: { topicId: existing.id, platform: link.platform, value: link.value },
          });
        }
      }

      if (status !== undefined) {
        await tx.submission.updateMany({
          where: { topicId: existing.id },
          data: {
            status,
            decidedAt: new Date(),
          },
        });
      }

      return topic;
    });

    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error('Failed to update page:', error);

    return NextResponse.json(
      { error: 'Failed to update page.' },
      { status: 500 }
    );
  }
}
