/** Free-form topic-type label (e.g. «مکانیکی خودرو», «استاد زبان»). */
export type TopicType = string;

export type TopicTypeKind = 'PRIMARY' | 'SECONDARY';

/** A type selected for a new topic. The first selected type is PRIMARY. */
export interface SelectedTopicType {
  label: TopicType;
  kind: TopicTypeKind;
}

/** A type attached to an existing topic (as returned by the API). */
export interface TopicTypeInfo {
  id: string;
  label: string;
  kind: TopicTypeKind;
}

export type LocationScope = 'NATIONAL' | 'PROVINCE' | 'CITY' | 'ADDRESS';

export const LOCATION_SCOPE_LABELS: Record<LocationScope, string> = {
  NATIONAL: 'سراسر کشور',
  PROVINCE: 'یک استان',
  CITY: 'یک شهر',
  ADDRESS: 'یک آدرس مشخص',
};

/**
 * Activity area of a topic — where it operates.
 * Province/city slugs reference the existing Province/City tables.
 */
export interface ActivityAreaValue {
  scope: LocationScope;
  provinceSlug?: string;
  provinceName?: string;
  citySlug?: string;
  cityName?: string;
  address?: string;
}

/** Local draft for the add-topic form — becomes the API payload later. */
export interface NewTopicDraft {
  name: string;
  types: SelectedTopicType[];
  description?: string;
  scope: LocationScope;
  provinceSlug?: string;
  citySlug?: string;
  address?: string;
}

export interface TopicSearchResult {
  id: string;
  name: string;
  /** Ordered labels — the primary type comes first. */
  types: string[];
  city?: string;
  /** Used for the permanent page URL (`/topic/{slug}`). Falls back to id. */
  slug?: string;
}

/** A candidate surfaced by duplicate detection. */
export interface DuplicateTopic {
  id: string;
  slug: string;
  name: string;
  /** Ordered labels — the primary type comes first. */
  types: string[];
  status: 'APPROVED' | 'PENDING';
  locationLabel: string;
  score: number;
}

/** A single suggestion from the topic-type autocomplete pool. */
export interface TopicTypeSuggestion {
  id: string;
  label: string;
}

/**
 * Permanent topic page URL — the `/topic/[id]` route accepts a UUID (any
 * status) or a slug (approved topics only). Centralized so every link stays
 * consistent.
 */
export function topicHref(topic: Pick<TopicSearchResult, 'id' | 'slug'>): string {
  return `/topic/${topic.slug ?? topic.id}`;
}

/** Render the primary type label from an ordered list of labels. */
export function primaryTypeLabel(types: string[]): string {
  return types[0] || 'بدون نوع';
}

/** Render an ordered list of type labels as one string. */
export function topicTypesLabel(types: string[]): string {
  return types.filter(Boolean).join('، ') || 'بدون نوع';
}

/** Render a human-friendly activity-area string from a draft. */
export function activityAreaLabel(value: ActivityAreaValue): string {
  const parts: string[] = [];

  switch (value.scope) {
    case 'NATIONAL':
      return LOCATION_SCOPE_LABELS.NATIONAL;
    case 'PROVINCE':
      parts.push(value.provinceName ?? '');
      break;
    case 'CITY':
      parts.push(value.cityName ?? '');
      parts.push(value.provinceName ?? '');
      break;
    case 'ADDRESS':
      parts.push(value.address ?? '');
      parts.push(value.cityName ?? '');
      parts.push(value.provinceName ?? '');
      break;
  }

  return parts.filter(Boolean).join('، ') || LOCATION_SCOPE_LABELS[value.scope];
}
