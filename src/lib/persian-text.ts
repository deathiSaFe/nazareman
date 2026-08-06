/**
 * Persian text normalization and fuzzy-matching helpers.
 *
 * Normalization aligns common Arabic glyph variants with their Persian
 * equivalents so that user input and stored labels compare consistently.
 * The matching helpers are intentionally small and dependency-free.
 */

const ARABIC_TO_PERSIAN: Record<string, string> = {
  '\u0643': '\u06A9', // Arabic kaf  -> Persian kaf
  '\u064A': '\u06CC', // Arabic yeh  -> Persian yeh
  '\u0649': '\u06CC', // Arabic alef maksura -> Persian yeh
  '\u064B': '', // fathatan
  '\u064C': '', // dammatan
  '\u064D': '', // kasratan
  '\u064E': '', // fatha
  '\u064F': '', // damma
  '\u0650': '', // kasra
  '\u0651': '', // shadda
  '\u0652': '', // sukun
};

/** Normalize Persian/Arabic text for comparison. */
export function normalizePersian(value: string): string {
  let result = value;

  for (const [from, to] of Object.entries(ARABIC_TO_PERSIAN)) {
    result = result.split(from).join(to);
  }

  return (
    result
      // Arabic tatweel
      .replace(/\u0640/g, '')
      // Zero-width space / no-break space / word joiner -> plain space
      .replace(/[\u200B\u200C\u200D\u00A0\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

const TOKEN_SPLIT = /[\s,،;؛.():«»"'`]+/;

/** Split Persian text into whitespace/punctuation-delimited tokens. */
export function tokenizePersian(value: string): string[] {
  const normalized = normalizePersian(value);
  if (!normalized) return [];

  return normalized
    .split(TOKEN_SPLIT)
    .map((token) => token.trim())
    .filter(Boolean);
}

/** Dice coefficient over the character sets of two strings (0..1). */
export function charDice(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const aSet = new Set(a);
  const bSet = new Set(b);

  let shared = 0;
  for (const char of aSet) {
    if (bSet.has(char)) shared += 1;
  }

  return (2 * shared) / (aSet.size + bSet.size);
}

/**
 * Score how well a query matches a suggestion label for the autocomplete.
 * Ranks exact > prefix > substring > shared token > per-token character overlap.
 * Returns 0 when the match is not meaningful.
 */
export function suggestionScore(query: string, label: string): number {
  const q = normalizePersian(query);
  const l = normalizePersian(label);

  if (!q || !l) return 0;
  if (q === l) return 1;
  if (l.startsWith(q)) return 0.95;
  if (l.includes(q)) return 0.9;

  const queryTokens = tokenizePersian(q);
  const labelTokens = tokenizePersian(l);

  if (queryTokens.some((token) => labelTokens.includes(token))) return 0.85;

  // Too short for reliable character-level matching.
  if (q.length < 3) return 0;

  const candidates = labelTokens.length > 0 ? labelTokens : [l];

  let best = charDice(q, l);

  for (const token of candidates) {
    const score = charDice(q, token);
    if (score > best) best = score;
  }

  return best >= 0.5 ? best : 0;
}
