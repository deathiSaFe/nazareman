'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PlusIcon, SearchIcon, XIcon } from '@/components/icons';
import { normalizePersian } from '@/lib/persian-text';
import type { TopicTypeSuggestion } from '@/types/topic';

interface TypeAutocompleteProps {
  value: string;
  onChange: (label: string) => void;
  /** Fired on every keystroke so the parent can clear validation state. */
  onQueryChange?: (query: string) => void;
  className?: string;
}

const DEBOUNCE_MS = 300;
const ROTATE_INTERVAL_MS = 4000;

const TYPE_EXAMPLES = [
  'مکانیکی خودرو',
  'رستوران',
  'دندان‌پزشک',
  'مدرسه',
  'استاد دانشگاه',
  'فروشگاه موبایل',
  'کافی‌شاپ',
  'پیرایشگاه',
];

export function TypeAutocomplete({
  value,
  onChange,
  onQueryChange,
  className = '',
}: TypeAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<TopicTypeSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [customMode, setCustomMode] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Rotating placeholder — same behaviour as the topic-name field.
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % TYPE_EXAMPLES.length);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  const trimmedQuery = query.trim();
  const normalizedQuery = normalizePersian(trimmedQuery);

  // A suggestion is an exact match only when the normalized labels are equal.
  // Approximate matches (e.g. «دندان پزشکی» vs «دندانپزشک») are suggestions
  // only — the user always stays in control.
  const exactMatch = suggestions.find(
    (suggestion) => normalizePersian(suggestion.label) === normalizedQuery
  );

  // The "create new type" action is a normal workflow step. It is always
  // visible (separated from results) whenever there is no exact match — never
  // hidden behind results and never treated like an error.
  const hasCustomOption =
    trimmedQuery.length > 0 && !loading && !exactMatch;

  const closeDropdown = () => {
    setOpen(false);
    setCustomMode(false);
  };

  const fetchSuggestions = useCallback(async (term: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!term.trim()) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const response = await fetch(
        `/api/topic-types/suggestions?q=${encodeURIComponent(term.trim())}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const payload = await response.json();
      const items: TopicTypeSuggestion[] = payload.suggestions ?? [];

      // Only the latest request may touch state — aborted/superseded requests
      // must not clear the loading flag or overwrite newer results.
      if (abortRef.current === controller) {
        setSuggestions(items);
        setActiveIndex(-1);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      if (abortRef.current === controller) {
        setSuggestions([]);
      }
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  const handleQueryChange = (term: string) => {
    setQuery(term);
    setCustomMode(false);
    onQueryChange?.(term);

    // Open immediately so the feedback is instant and never depends on the
    // network round-trip. `loading` suppresses the custom row while fetching.
    if (term.trim()) {
      setOpen(true);
      setLoading(true);
    } else {
      setOpen(false);
      setLoading(false);
      setSuggestions([]);
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(term);
    }, DEBOUNCE_MS);
  };

  const selectLabel = (label: string) => {
    onChange(label);
    // Reset the input so the same autocomplete can pick the next type.
    setQuery('');
    setSuggestions([]);
    setActiveIndex(-1);
    closeDropdown();
  };

  const submitCustom = () => {
    const label = customLabel.trim() || trimmedQuery;
    if (!label) return;

    selectLabel(label);

    // Persist as a PENDING suggestion for admin review. Failures are silent —
    // the submission endpoint records the label again as a safety net.
    void fetch('/api/topic-types/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    }).catch(() => undefined);
  };

  const clearSelection = () => {
    setQuery('');
    setSuggestions([]);
    closeDropdown();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => {
        const maxIndex =
          suggestions.length - 1 + (hasCustomOption ? 1 : 0);
        return prev >= maxIndex ? 0 : prev + 1;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => {
        const maxIndex =
          suggestions.length - 1 + (hasCustomOption ? 1 : 0);
        return prev <= 0 ? maxIndex : prev - 1;
      });
      return;
    }

    if (event.key === 'Enter') {
      if (customMode) {
        event.preventDefault();
        submitCustom();
        return;
      }

      // While the dropdown is open, Enter selects — never submit the form.
      if (!open) return;

      event.preventDefault();

      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        // The user explicitly navigated to a suggestion.
        selectLabel(suggestions[activeIndex].label);
      } else if (activeIndex === suggestions.length && hasCustomOption) {
        setCustomMode(true);
        setCustomLabel(trimmedQuery);
      } else if (exactMatch) {
        // Automatic selection only for an exact normalized match.
        selectLabel(exactMatch.label);
      } else if (hasCustomOption) {
        setCustomMode(true);
        setCustomLabel(trimmedQuery);
      }

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
    }
  };

  // Close when the user clicks/taps outside the autocomplete. No timeouts, no
  // blur heuristics — the dropdown stays open until selection, Escape, or an
  // outside pointer interaction.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="group flex items-center gap-3 rounded-[22px] bg-white pe-3 ps-5 ring-1 ring-ink-900/[0.06] shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-turquoise-600/70 focus-within:shadow-[0_18px_40px_-16px_rgba(26,99,93,0.45)]">
        <SearchIcon
          strokeWidth={2.2}
          className="size-5 shrink-0 text-ink-900/30 transition-colors group-focus-within:text-turquoise-700"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            // Reopen only while the user is actively editing a term, not after
            // a selection has already been confirmed.
            if (query.trim() && query !== value) {
              setOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="topic-type-listbox"
          aria-label="نوع موضوع"
          placeholder={TYPE_EXAMPLES[placeholderIndex]}
          autoComplete="off"
          enterKeyHint="done"
          className="h-14 w-full min-w-0 bg-transparent text-[15px] font-medium text-ink-900 caret-turquoise-700 outline-none placeholder:font-normal placeholder:text-ink-900/35"
        />
        {query.length > 0 && (
          <button
            type="button"
            onPointerDown={(event) => event.preventDefault()}
            onClick={clearSelection}
            aria-label="پاک کردن نوع موضوع"
            className="grid size-7 shrink-0 place-items-center rounded-full text-ink-900/35 transition-colors hover:bg-ink-900/5 hover:text-ink-900/70"
          >
            <XIcon strokeWidth={2.4} className="size-3.5" />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute mt-2 h-1 w-16 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-turquoise-500 motion-reduce:animate-none" />
        </div>
      )}

      {open && (suggestions.length > 0 || hasCustomOption) && (
        <ul
          id="topic-type-listbox"
          role="listbox"
          aria-label="پیشنهادهای نوع موضوع"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[22px] bg-white p-2 ring-1 ring-ink-900/[0.08] shadow-[0_20px_50px_-20px_rgba(21,67,63,0.45)]"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="option" aria-selected={activeIndex === index}>
              <button
                type="button"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => selectLabel(suggestion.label)}
                className={`flex w-full items-center rounded-2xl px-4 py-3 text-start text-[14px] font-medium transition-colors ${
                  activeIndex === index
                    ? 'bg-turquoise-50 text-turquoise-900'
                    : 'text-ink-800 hover:bg-ink-900/[0.04]'
                }`}
              >
                {suggestion.label}
              </button>
            </li>
          ))}

          {hasCustomOption && (
            <li
              role="option"
              aria-selected={activeIndex === suggestions.length}
            >
              {customMode ? (
                <div className="flex items-center gap-2 p-2">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(event) => setCustomLabel(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitCustom();
                      } else if (event.key === 'Escape') {
                        event.preventDefault();
                        closeDropdown();
                      }
                    }}
                    autoFocus
                    placeholder={trimmedQuery}
                    aria-label="نوع موضوع موردنظر"
                    className="h-12 min-w-0 flex-1 rounded-2xl bg-ink-900/[0.04] px-4 text-[14px] font-medium text-ink-900 outline-none ring-1 ring-transparent transition-colors focus:bg-white focus:ring-turquoise-600/60"
                  />
                  <button
                    type="button"
                    onClick={submitCustom}
                    className="shrink-0 rounded-full bg-turquoise-600 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-turquoise-700"
                  >
                    افزودن
                  </button>
                </div>
              ) : (
                <div className="mt-1 border-t border-ink-900/[0.08] px-1 pb-1 pt-2">
                  <p className="px-3 pb-1 text-[12px] font-medium text-ink-900/45">
                    نوع موردنظر را پیدا نکردید؟
                  </p>
                  <button
                    type="button"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setCustomMode(true);
                      setCustomLabel(trimmedQuery);
                    }}
                    className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-start text-[14px] font-bold transition-colors ${
                      activeIndex === suggestions.length
                        ? 'bg-turquoise-50 text-turquoise-700'
                        : 'text-ink-900/70 hover:bg-turquoise-50 hover:text-turquoise-700'
                    }`}
                  >
                    <PlusIcon strokeWidth={2.6} className="size-4 shrink-0 text-turquoise-600" />
                    <span className="truncate">
                      ایجاد نوع جدید: «{trimmedQuery}»
                    </span>
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
