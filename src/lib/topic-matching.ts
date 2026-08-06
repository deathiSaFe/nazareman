/**
 * Duplicate-topic detection scoring.
 *
 * A new topic is compared to existing topics on three axes:
 *   - name similarity   (token overlap / containment)
 *   - type similarity   (primary type is the main signal; secondary types
 *                        may only nudge confidence, never dominate)
 *   - location overlap  (same city > same province > nationwide)
 *
 * Location carries the highest weight, so "مکانیکی علی" in a city will
 * surface "تعمیرگاه علی" in the same city, but not one in another city.
 */
import { charDice, normalizePersian, tokenizePersian } from './persian-text';
import type { LocationScope } from '@/types/topic';

export const MATCH_THRESHOLD = 0.55;

const WEIGHT_NAME = 0.4;
const WEIGHT_TYPE = 0.15;
const WEIGHT_LOCATION = 0.45;

const SECONDARY_TYPE_BOOST = 0.1;

export interface DuplicateQuery {
  name: string;
  /** Ordered type labels — the primary type comes first. */
  types?: string[];
  scope?: LocationScope;
  provinceId?: string;
  cityId?: string;
}

export interface TopicForMatch {
  id: string;
  slug: string;
  name: string;
  /** Ordered type labels — the primary type comes first. */
  types: string[];
  status: 'APPROVED' | 'PENDING';
  provinceId: string | null;
  cityId: string | null;
}

/** Similarity of two topic names (0..1). */
export function nameSimilarity(left: string, right: string): number {
  const a = normalizePersian(left);
  const b = normalizePersian(right);

  if (!a || !b) return 0;
  if (a === b) return 1;

  // One name fully contained in the other (e.g. "مکانیکی علی" vs "مکانیکی علی جنوبی").
  if (a.includes(b) || b.includes(a)) return 0.9;

  const aTokens = tokenizePersian(a);
  const bTokens = tokenizePersian(b);

  if (aTokens.length === 0 || bTokens.length === 0) return 0;

  const shared = aTokens.filter((token) => bTokens.includes(token)).length;

  if (shared === 0) return 0;

  return shared / Math.max(aTokens.length, bTokens.length);
}

/** Similarity of two topic-type labels (0..1). */
export function typeSimilarity(left: string, right: string): number {
  const a = normalizePersian(left);
  const b = normalizePersian(right);

  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.7;

  const aTokens = tokenizePersian(a);
  const bTokens = tokenizePersian(b);

  if (aTokens.some((token) => bTokens.includes(token))) return 0.6;

  return charDice(a, b) >= 0.5 ? 0.4 : 0;
}

/**
 * Multi-type similarity. The primary type (first in each ordered list) is the
 * main signal. Shared secondary types only add a small boost and can never
 * produce a match on their own — if the primaries don't overlap at all the
 * score stays 0.
 */
export function multiTypeSimilarity(
  queryTypes: string[],
  topicTypes: string[]
): number {
  const base = typeSimilarity(queryTypes[0] ?? '', topicTypes[0] ?? '');

  if (base === 0) return 0;

  const querySecondary = new Set(queryTypes.slice(1));
  const sharedSecondary = topicTypes
    .slice(1)
    .filter((label) => querySecondary.has(label)).length;

  return Math.min(1, base + sharedSecondary * SECONDARY_TYPE_BOOST);
}

/** Location overlap between the query and an existing topic (0..1). */
export function locationScore(query: DuplicateQuery, topic: TopicForMatch): number {
  const topicLocated = Boolean(topic.provinceId || topic.cityId);
  const queryLocated = Boolean(query.provinceId || query.cityId);

  // Nationwide topic.
  if (!topicLocated) {
    if (!queryLocated) return 0.6;
    return 0.3;
  }

  // Nationwide query against a located topic.
  if (!queryLocated) return 0.25;

  if (query.cityId) {
    if (topic.cityId === query.cityId) return 1;
    if (topic.provinceId && topic.provinceId === query.provinceId) return 0.55;
    return 0;
  }

  if (query.provinceId) {
    if (topic.provinceId === query.provinceId) return 0.6;
    return 0;
  }

  return 0;
}

/**
 * Combined duplicate score (0..1).
 * Returns 0 when there is no name overlap or no location overlap at all,
 * so unrelated topics in the same city are never surfaced.
 */
export function scoreTopic(query: DuplicateQuery, topic: TopicForMatch): number {
  const nameScore = nameSimilarity(query.name, topic.name);

  if (nameScore === 0) return 0;

  const typeScore = multiTypeSimilarity(query.types ?? [], topic.types);
  const location = locationScore(query, topic);

  if (location === 0) return 0;

  return WEIGHT_NAME * nameScore + WEIGHT_TYPE * typeScore + WEIGHT_LOCATION * location;
}
