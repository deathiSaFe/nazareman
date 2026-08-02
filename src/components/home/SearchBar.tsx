'use client';

import { useState, type FormEvent } from 'react';
import { SearchIcon } from '@/components/icons';
import { FilterButton } from './FilterButton';

interface SearchBarProps {
  placeholder?: string;
  activeFilterCount?: number;
  /** Fired on Enter / keyboard search key. */
  onSearch?: (query: string) => void;
  onOpenFilters?: () => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'دنبال چه چیزی می‌گردید؟',
  activeFilterCount = 0,
  onSearch,
  onOpenFilters,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    onSearch?.(q);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={`group ${className}`}>
      <div
        className="flex items-stretch overflow-hidden rounded-[26px] bg-white ring-1 ring-ink-900/[0.06]
                   shadow-[0_12px_35px_-12px_rgba(21,67,63,0.25)] transition-all duration-300
                   focus-within:-translate-y-0.5 focus-within:shadow-[0_22px_50px_-16px_rgba(26,99,93,0.4)] focus-within:ring-2 focus-within:ring-turquoise-600/70"
      >
        <label className="flex min-w-0 flex-1 cursor-text items-center gap-3 pe-1 ps-5">
          <SearchIcon className="size-5 shrink-0 text-ink-900/30 transition-colors duration-300 group-focus-within:text-turquoise-700" />
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            enterKeyHint="search"
            autoComplete="off"
            className="h-16 w-full min-w-0 bg-transparent text-[15px] font-medium text-ink-900 caret-turquoise-700 outline-none placeholder:font-normal placeholder:text-ink-900/35 md:h-[70px] md:text-base [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:none"
          />
        </label>

        <span
          aria-hidden
          className="my-4 w-px shrink-0 bg-ink-900/10 transition-colors group-focus-within:bg-turquoise-600/25"
        />

        <FilterButton activeCount={activeFilterCount} onClick={onOpenFilters} />
      </div>
    </form>
  );
}