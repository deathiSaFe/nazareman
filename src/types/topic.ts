/** Topic-type taxonomy for the "add new topic" flow. */
export type TopicType =
  | 'person'
  | 'business'
  | 'place'
  | 'product'
  | 'education'
  | 'medical'
  | 'organization'
  | 'other';

export interface TopicTypeOption {
  id: TopicType;
  label: string;
  emoji: string;
  /** City is only asked for location-based types. */
  locationBased: boolean;
}

/** Local draft for the add-topic form — becomes the API payload later. */
export interface NewTopicDraft {
  type: TopicType;
  name: string;
  city?: string;
  description?: string;
}

export const TOPIC_TYPES: TopicTypeOption[] = [
  { id: 'person', label: 'شخص', emoji: '👤', locationBased: true },
  { id: 'business', label: 'کسب‌وکار', emoji: '🏢', locationBased: true },
  { id: 'place', label: 'مکان', emoji: '📍', locationBased: true },
  { id: 'product', label: 'محصول', emoji: '📦', locationBased: false },
  { id: 'education', label: 'آموزشگاه / دانشگاه', emoji: '🎓', locationBased: true },
  { id: 'medical', label: 'پزشک / درمان', emoji: '🏥', locationBased: true },
  { id: 'organization', label: 'سازمان', emoji: '🏛', locationBased: true },
  { id: 'other', label: 'سایر', emoji: '📂', locationBased: false },
];
/** A hit from the future duplicate-search endpoint. */
export interface TopicSearchResult {
  id: string;
  name: string;
  type: TopicType;
  city?: string;
  /** Used for the permanent page URL (`/topic/{slug}`). Falls back to id. */
  slug?: string;
}

/**
 * Permanent topic page URL — the `/topic/[id]` route will be implemented later.
 * Centralizing it here keeps every future link consistent.
 */
export function topicHref(topic: Pick<TopicSearchResult, 'id' | 'slug'>): string {
  return `/topic/${topic.slug ?? topic.id}`;
}