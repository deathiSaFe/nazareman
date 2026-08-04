'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SearchIcon } from '@/components/icons';
import { TOPIC_TYPES } from '@/types/topic';

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  city: {
    name: string;
    slug: string;
    province: {
      name: string;
      slug: string;
    };
  } | null;
};

type SearchState = 'idle' | 'loading' | 'success' | 'error';

function getTypeLabel(type: string): string {
  const found = TOPIC_TYPES.find((t) => (t.id as string) === type);
  return found?.label ?? type;
}

export function SearchSection() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchState('idle');
      setResults([]);
      setHasSearched(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSearchState('loading');
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/topics?search=${encodeURIComponent(searchTerm.trim())}&limit=10`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const payload = await response.json();
      const topics: SearchResult[] = payload.topics ?? payload.data ?? [];

      setResults(topics);
      setSearchState('success');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setSearchState('error');
      setResults([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearchState('idle');
    setHasSearched(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const addTopicUrl = query.trim()
    ? `/add-topic?name=${encodeURIComponent(query.trim())}`
    : '/add-topic';

  return (
    <section className="w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="group flex items-center gap-3 rounded-[22px] bg-white pe-4 ps-5 ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-turquoise-600/70 focus-within:shadow-[0_18px_40px_-16px_rgba(26,99,93,0.45)]">
          <SearchIcon
            strokeWidth={2.2}
            className="size-5 shrink-0 text-ink-900/30 transition-colors group-focus-within:text-turquoise-700"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="جستجوی موضوع..."
            aria-label="جستجوی موضوع"
            enterKeyHint="search"
            autoComplete="off"
            className="h-14 w-full min-w-0 bg-transparent text-[15px] font-medium text-ink-900 caret-turquoise-700 outline-none placeholder:font-normal placeholder:text-ink-900/35 md:h-[60px] [&::-webkit-search-cancel-button]:hidden"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="پاک کردن جستجو"
              className="grid size-7 shrink-0 place-items-center rounded-full text-ink-900/35 transition-colors hover:bg-ink-900/5 hover:text-ink-900/70"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
        </div>

        {/* Loading Indicator */}
        {searchState === 'loading' && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <div className="h-1 w-16 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-turquoise-500 motion-reduce:animate-none" />
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      <div className="mt-6">
        {/* Error State */}
        {searchState === 'error' && (
          <div className="rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-100">
            <p className="text-sm text-red-700">
              جستجو با خطا مواجه شد. لطفاً دوباره تلاش کنید.
            </p>
            <button
              type="button"
              onClick={() => performSearch(query)}
              className="mt-3 text-sm font-bold text-red-600 underline underline-offset-4 hover:text-red-700"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty State */}
        {searchState === 'success' && hasSearched && results.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-ink-900/[0.06] shadow-sm">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-saffron-50">
              <SearchIcon strokeWidth={2} className="size-6 text-saffron-600" />
            </div>
            <p className="text-[15px] font-medium text-ink-700">
              موضوع موردنظر پیدا نشد. می‌توانید آن را ایجاد کنید.
            </p>
            <Link
              href={addTopicUrl}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-turquoise-600 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all hover:-translate-y-0.5 hover:bg-turquoise-700 active:translate-y-0 active:scale-[0.97]"
            >
              ایجاد موضوع جدید
            </Link>
          </div>
        )}

        {/* Results List */}
        {searchState === 'success' && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-ink-400">
              {results.length} نتیجه یافت شد
            </p>

            {results.map((topic) => (
              <Link
                key={topic.id}
                href={`/topic/${topic.slug}`}
                className="block rounded-2xl bg-white p-4 ring-1 ring-ink-900/[0.06] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base text-ink-900">
                      {topic.name}
                    </h3>
                    <p className="mt-1 truncate text-sm text-ink-500">
                      {getTypeLabel(topic.type)}
                      {topic.city && (
                        <> · {topic.city.name}</>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-turquoise-600/10 px-3 py-1 text-xs font-bold text-turquoise-700">
                    {getTypeLabel(topic.type)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-600">
                  {topic.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}