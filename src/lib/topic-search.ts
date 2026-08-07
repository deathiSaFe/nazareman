/**
 * Relevance scoring for free-text topic search.
 *
 * Every searchable field (name, attached type labels, description) is matched
 * against the query by a dedicated scorer, then combined by weight:
 *   - name         the most important signal
 *   - type labels  strong — searching a type must surface its topics
 *   - description  weakest — a passing mention still counts, but lowly
 *
 * Normalization aligns Arabic/Persian glyph variants (ك/ک, ي/ی) so «دكتور»
 * and «دکتر» compare identically. Matching deliberately reuses the text
 * utilities (`normalizePersian`, `tokenizePersian`) but is stricter than the
 * autocomplete scorer: it ranks on exact / prefix / substring / space-variant /
 * token-coverage tiers and drops fuzzy character-overlap matching, which is
 * far too noisy for full-topic search (e.g. «الغار» sharing two letters with
 * «رضا» must not surface a mechanic).
 *
 * Scoring is fully in-memory over a bounded candidate set — the practical
 * approach until the dataset outgrows it, at which point PostgreSQL
 * full-text / pg_trgm can take over.
 */
import { normalizePersian, tokenizePersian } from './persian-text';

const WEIGHT_NAME = 1.0;
const WEIGHT_TYPE = 0.8;
const WEIGHT_DESC = 0.4;

/** Only topics scoring at or above this are surfaced. */
export const SEARCH_MIN_SCORE = 0.35;

/** Minimum length for sub-string token matches (guards 1–2 char noise). */
const MIN_TOKEN_LENGTH = 3;

/** Minimum length for compact (space-stripped) containment matches. */
const MIN_COMPACT_LENGTH = 3;

/**
 * Near-miss spelling matcher: the shorter string is an in-order subsequence
 * of the longer one, and their lengths are close. Catches «دكتور» ~ «دکتر»
 * (one inserted letter) while rejecting words that merely share characters,
 * e.g. «مکانی» vs «مینا» (shared letters but not a subsequence).
 */
const MIN_NEAR_MISS_LENGTH = 4;
const MAX_NEAR_MISS_DIFF = 2;

function isNearMiss(a: string, b: string): boolean {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];

  if (short.length < MIN_NEAR_MISS_LENGTH) return false;
  if (long.length - short.length > MAX_NEAR_MISS_DIFF) return false;

  let matched = 0;

  for (let index = 0; index < long.length && matched < short.length; index += 1) {
    if (long[index] === short[matched]) matched += 1;
  }

  return matched === short.length;
}

export interface TopicForSearch {
  name: string;
  description: string | null;
  /** Ordered type labels — the primary type comes first. */
  types: string[];
}

function compact(value: string): string {
  return value.replace(/\s+/g, '');
}

/**
 * True when a query token is represented by a field token — either identical,
 * or (for meaningful token lengths) one contains the other, e.g.
 * «میوه» ~ «میوه‌فروشی», «کافه» ~ «کافی‌شاپ».
 */
function isTokenMatch(queryToken: string, fieldToken: string): boolean {
  if (queryToken === fieldToken) return true;
  if (queryToken.length < MIN_TOKEN_LENGTH) return false;

  return fieldToken.includes(queryToken) || queryToken.includes(fieldToken);
}

/**
 * How well a single query string matches a single field string (0..1).
 * Tiers, in order: exact > space-variant equal > prefix > substring >
 * compact containment > token coverage.
 */
export function fieldMatchScore(query: string, field: string): number {
  const q = normalizePersian(query);
  const f = normalizePersian(field);

  if (!q || !f) return 0;

  if (q === f) return 1;

  const cq = compact(q);
  const cf = compact(f);

  // «میوه فروشی» == «میوه‌فروشی» — space-placement variants are identical.
  if (cq === cf) return 0.97;

  if (f.startsWith(q)) return 0.95;
  if (f.includes(q)) return 0.9;

  // Compact containment covers pairs that differ only in spacing, e.g.
  // query «میوه فرو» vs field «میوه‌فروشی».
  if (cq.length >= MIN_COMPACT_LENGTH && cf.includes(cq)) return 0.85;
  if (cf.length >= MIN_COMPACT_LENGTH && cq.includes(cf)) return 0.85;

  // Token coverage: how much of the query's intent is present in the field.
  // Full coverage is a strong match; a multi-token query matched in part
  // (e.g. «مکانیکی علی» vs «علی کافه») drops off meaningfully.
  const qTokens = tokenizePersian(q);
  const fTokens = tokenizePersian(f);

  if (qTokens.length > 0) {
    const matched = qTokens.filter((token) =>
      fTokens.some((fieldToken) => isTokenMatch(token, fieldToken))
    ).length;

    const coverage = matched / qTokens.length;

    if (coverage > 0) return 0.3 + 0.65 * coverage;
  }

  // Near-miss spellings that no token aligns with, e.g. «دكتور» (with a waw)
  // vs «دکتر». Requires an in-order subsequence with close lengths, so words
  // that merely share letters («مکانی» vs «مینا») never pass.
  if (isNearMiss(q, f)) return 0.7;

  for (const fieldToken of fTokens) {
    if (isNearMiss(q, fieldToken)) return 0.7;
  }

  return 0;
}

/**
 * Relevance of a topic to a free-text query (0..1). Returns 0 when no field
 * matches meaningfully, so unrelated topics are never surfaced.
 */
export function searchScore(query: string, topic: TopicForSearch): number {
  const normalizedQuery = normalizePersian(query);

  if (!normalizedQuery) return 0;

  const nameScore = fieldMatchScore(normalizedQuery, topic.name);

  let typeScore = 0;
  for (const label of topic.types) {
    const score = fieldMatchScore(normalizedQuery, label);
    if (score > typeScore) typeScore = score;
  }

  let descScore = 0;
  if (topic.description) {
    descScore = fieldMatchScore(normalizedQuery, topic.description);
  }

  return Math.max(
    WEIGHT_NAME * nameScore,
    WEIGHT_TYPE * typeScore,
    WEIGHT_DESC * descScore
  );
}
