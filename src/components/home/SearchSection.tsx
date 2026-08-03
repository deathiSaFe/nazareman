'use client';

import { useState } from 'react';
import { MapPinIcon, NavIcon, UtensilsIcon } from '@/components/icons';
import type { ActiveFilter } from '@/types/filters';
import { SearchBar } from './SearchBar';
import { ActiveFilterChips } from './ActiveFilterChips';
import { AddTopicButton } from './AddTopicButton';

/**
 * Seed chips for the homepage UI.
 * Once search is real, this state moves to the filter store / URL query params.
 * `nearest` mirrors SearchFilters.nearestFirst — enabled by default.
 */
const initialFilters: ActiveFilter[] = [
  { id: 'nearest', kind: 'proximity', label: 'نزدیک‌ترین', emphasized: true, icon: <NavIcon strokeWidth={2.2} /> },
  { id: 'tehran', kind: 'city', label: 'تهران', icon: <MapPinIcon strokeWidth={2.2} /> },
  { id: 'restaurant', kind: 'entryType', label: 'رستوران', icon: <UtensilsIcon strokeWidth={2.2} /> },
];

/**
 * Renders two direct rows of the hero grid (via fragment):
 *   row 2 → search bar (the focal point)
 *   row 3 → active filter chips + "add topic" CTA
 */
export function SearchSection() {
  const [filters, setFilters] = useState<ActiveFilter[]>(initialFilters);

  return (
    <>
      <SearchBar
        className="mx-auto w-full max-w-2xl animate-fade-up [animation-delay:280ms] motion-reduce:animate-none"
        activeFilterCount={filters.length}
        onSearch={(query) => {
          // TODO(search): route to /search?q=… once the results page exists.
          void query;
        }}
        onOpenFilters={() => {
          // TODO(filters): open the FilterSheet bottom sheet
          // (province / city / entry type / current location / radius 1–100 km).
        }}
      />

      <div className="mx-auto w-full max-w-2xl animate-fade-up pt-5 [animation-delay:360ms] motion-reduce:animate-none">
        {/* fixed min-height so clearing the last chip doesn't jump the layout */}
        <div className="flex min-h-9 items-start">
          <ActiveFilterChips
            filters={filters}
            onRemove={(id) => setFilters((prev) => prev.filter((f) => f.id !== id))}
            onClearAll={() => setFilters([])}
          />
        </div>

        <div className="mt-12 flex justify-center md:mt-14">
          <AddTopicButton />
        </div>
      </div>
    </>
  );
}