import type { ReactNode } from 'react';

/** Entry taxonomy — mirrors the future database model. */
export type EntryType =
  | 'place'      // رستوران، کافه، فروشگاه…
  | 'person'     // پزشک، آرایشگر، استاد…
  | 'product'    // گوشی، لوازم خانگی…
  | 'website'
  | 'instagram'
  | 'business'
  | 'other';

/**
 * Full search-filter state.
 * - `useCurrentLocation` will be resolved through the Neshan Maps SDK.
 * - `nearestFirst` («نزدیک‌ترین») is enabled by default on the homepage.
 * - `radiusKm` is optional and clamped to 1–100.
 */
export interface SearchFilters {
  query: string;
  provinceId?: string;
  cityId?: string;
  entryTypes?: EntryType[];
  useCurrentLocation?: boolean;
  nearestFirst?: boolean;
  radiusKm?: number;
}

/** A single rendered chip under the search bar. */
export interface ActiveFilter {
  id: string;
  label: string;
  kind: 'province' | 'city' | 'entryType' | 'proximity' | 'location' | 'radius';
  icon?: ReactNode;
  /** Default filters (e.g. nearest-first) render emphasized. */
  emphasized?: boolean;
  removable?: boolean;
}