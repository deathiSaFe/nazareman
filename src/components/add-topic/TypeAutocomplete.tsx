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
  /**
   * Ref to the section that contains the field's label AND this input.
   * Used as the mobile keyboard scroll target so the whole section (not just
   * the input) ends up near the top of the visible viewport.
   */
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

const DEBOUNCE_MS = 300;
const ROTATE_INTERVAL_MS = 4000;

/** Maximum height the fixed dropdown may occupy (suggestions scroll inside). */
const DROPDOWN_MAX_HEIGHT = 320;

/** True on phones/tablets whose primary input is a touchscreen. */
function isTouchPrimary(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Detect an open mobile keyboard:
 *  - visual viewport smaller than the layout viewport (iOS overlay), or
 *  - a coarse-pointer device whose layout viewport shrank noticeably
 *    (Android `adjustResize`).
 */
function isMobileKeyboardOpen(): boolean {
  if (typeof window === 'undefined') return false;
  const vv = window.visualViewport;
  if (vv && vv.height < window.innerHeight - 1) return true;
  return isTouchPrimary() && window.innerHeight < window.screen.height * 0.8;
}

/** Find the scrollable ancestor of an element, or the window as a fallback. */
function getScrollContainer(el: HTMLElement): HTMLElement | Window {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    if (/(auto|scroll|overlay)/.test(window.getComputedStyle(node).overflowY)) {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

/** Scroll whatever container owns the scroll position by the given delta. */
function scrollByDelta(container: HTMLElement | Window, delta: number) {
  if (container === window) {
    window.scrollTo({ top: window.scrollY + delta, behavior: 'smooth' });
    return;
  }
  const el = container as HTMLElement;
  if (el === document.documentElement || el === document.body) {
    window.scrollTo({ top: window.scrollY + delta, behavior: 'smooth' });
    return;
  }
  el.scrollTop += delta;
}

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
  sectionRef,
  className = '',
}: TypeAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<TopicTypeSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [customMode, setCustomMode] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Guards the one-time "bring the input above the keyboard" scroll.
  const scrolledForKeyboardRef = useRef(false);

  // On mobile the keyboard overlays the page (iOS-style). When that happens we
  // switch the dropdown to `position: fixed`, computed from the Visual Viewport
  // so it stays above the keyboard — the input itself never moves.
  // `placement` being non-null also means "fixed mode is active".
  const [placement, setPlacement] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const fixedMode = placement !== null;

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
    setPlacement(null);
    scrolledForKeyboardRef.current = false;
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

  /**
   * Mobile keyboard handling.
   *
   * When the keyboard overlays the page (visual viewport smaller than the
   * layout viewport — iOS-style):
   *   1. A ONE-TIME controlled scroll brings the active input up so it is
   *      clearly above the keyboard, leaving room for the dropdown below it.
   *      (The browser already auto-scrolls the focused field on iOS; this only
   *      nudges it further to make room.)
   *   2. The dropdown is placed with `position: fixed` directly BELOW the
   *      input, using the remaining visible space (never covering the input).
   * There is no repeated scrolling and no feedback loop: the scroll happens
   * once per keyboard session, and later viewport changes only resize the
   * dropdown. When the keyboard is closed (or on desktop / Android where the
   * layout viewport resizes instead), the dropdown uses normal absolute
   * positioning below the input.
   */
  const scrollForKeyboard = useCallback(() => {
    // Target the whole section (label + input), not just the input bar.
    const section = sectionRef?.current ?? containerRef.current;
    const vv = window.visualViewport;
    if (!section || !vv) return;
    if (!isMobileKeyboardOpen()) return;

    // Small intentional top margin (8–16px).
    const TOP_MARGIN = 12;

    // If the sticky header visibly covers the top of the visible viewport,
    // place the section just below it; otherwise place it at the top.
    let targetVisualTop = TOP_MARGIN;
    const header = document.querySelector<HTMLElement>('header.sticky');
    if (header) {
      const headerVisualBottom =
        header.getBoundingClientRect().bottom - vv.offsetTop;
      if (headerVisualBottom > 16) {
        targetVisualTop = headerVisualBottom + TOP_MARGIN;
      }
    }

    // Desired layout position of the section top, then measure the delta.
    const targetSectionTop = vv.offsetTop + targetVisualTop;
    const sectionRect = section.getBoundingClientRect();
    const delta = sectionRect.top - targetSectionTop;

    if (Math.abs(delta) < 2) return;

    scrollByDelta(getScrollContainer(section), delta);
  }, [sectionRef]);

  const layoutDropdown = useCallback(() => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const vv = window.visualViewport;

    const keyboardOpen = !!vv && isMobileKeyboardOpen();

    let next: {
      top: number;
      left: number;
      width: number;
      height: number;
    } | null = null;

    if (keyboardOpen) {
      const margin = 8;
      const vBottom = vv.offsetTop + vv.height;

      const inputRect = input.getBoundingClientRect();

      // Always below the input; use only the visible space remaining below it.
      const top = inputRect.bottom + margin;
      const maxSpace = vBottom - margin - top;
      const height = Math.min(Math.max(maxSpace, 40), DROPDOWN_MAX_HEIGHT);

      next = { top, left: inputRect.left, width: inputRect.width, height };
    }

    // Only re-render when the geometry actually changed — avoids re-rendering
    // on every scroll/resize tick and any feedback loop with the keyboard.
    setPlacement((prev) => {
      if (next === null) return null;
      if (
        prev &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  // One-time scroll when the field is focused and the mobile keyboard opens.
  // Runs on focus (not only when the dropdown is open) so the page always moves
  // the field up above the keyboard. Guarded so it happens once per keyboard
  // session and never loops with visualViewport resize events.
  useEffect(() => {
    if (!focused) return;

    const vv = window.visualViewport;

    // The keyboard transition can take a moment; once it has opened, position
    // the section, then re-measure once more after it settles. One-time only.
    let settleTimer: number | undefined;

    const handleResize = () => {
      if (isMobileKeyboardOpen()) {
        if (!scrolledForKeyboardRef.current) {
          scrolledForKeyboardRef.current = true;
          requestAnimationFrame(scrollForKeyboard);

          if (settleTimer === undefined) {
            settleTimer = window.setTimeout(() => {
              scrollForKeyboard();
            }, 300);
          }
        }
      } else {
        scrolledForKeyboardRef.current = false;
      }
    };

    // Check immediately and again shortly after — some keyboards take a moment
    // to appear and may not fire a visualViewport resize.
    const raf0 = requestAnimationFrame(handleResize);
    const timer = window.setTimeout(handleResize, 250);

    vv?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf0);
      window.clearTimeout(timer);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      scrolledForKeyboardRef.current = false;
      vv?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [focused, scrollForKeyboard]);

  // Position the open dropdown below the input within the visible area, and
  // keep it there as the keyboard appears/disappears or the page scrolls.
  useEffect(() => {
    if (!open) return;

    const vv = window.visualViewport;
    const raf = requestAnimationFrame(layoutDropdown);

    vv?.addEventListener('resize', layoutDropdown);
    window.addEventListener('resize', layoutDropdown);
    vv?.addEventListener('scroll', layoutDropdown);
    window.addEventListener('scroll', layoutDropdown);

    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener('resize', layoutDropdown);
      window.removeEventListener('resize', layoutDropdown);
      vv?.removeEventListener('scroll', layoutDropdown);
      window.removeEventListener('scroll', layoutDropdown);
    };
  }, [open, layoutDropdown]);

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
            setFocused(true);
            // Re-arm the one-time keyboard scroll for this focus session.
            scrolledForKeyboardRef.current = false;
            // Reopen only while the user is actively editing a term, not after
            // a selection has already been confirmed.
            if (query.trim() && query !== value) {
              setOpen(true);
            }
          }}
          onBlur={() => setFocused(false)}
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
        <div className="absolute top-full mt-3 h-1 w-16 overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-turquoise-500 motion-reduce:animate-none" />
        </div>
      )}

      {open && (suggestions.length > 0 || hasCustomOption) && (
        <ul
          id="topic-type-listbox"
          role="listbox"
          aria-label="پیشنهادهای نوع موضوع"
          className={`z-50 flex flex-col overflow-hidden rounded-[22px] bg-white p-2 ring-1 ring-ink-900/[0.08] shadow-[0_20px_50px_-20px_rgba(21,67,63,0.45)] ${
            fixedMode ? 'fixed' : 'absolute top-full mt-2 max-h-72'
          }`}
          style={
            fixedMode && placement
              ? {
                  top: placement.top,
                  left: placement.left,
                  width: placement.width,
                  height: placement.height,
                }
              : undefined
          }
        >
          {/* Scrollable suggestions */}
          <div className="min-h-0 flex-1 overflow-y-auto">
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
          </div>

          {/* Fixed "create new type" action — never scrolls away */}
          {hasCustomOption && (
            <div className="shrink-0 border-t border-ink-900/[0.08] px-1 py-1.5">
              <li role="option" aria-selected={activeIndex === suggestions.length}>
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
                  <button
                    type="button"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setCustomMode(true);
                      setCustomLabel(trimmedQuery);
                    }}
                    aria-label={`نوع موردنظر پیدا نشد؟ افزودن: «${trimmedQuery}»`}
                    className={`flex w-full items-center gap-1.5 rounded-2xl px-3 py-2 text-start text-[13px] font-bold transition-colors ${
                      activeIndex === suggestions.length
                        ? 'bg-turquoise-50 text-turquoise-700'
                        : 'text-ink-900/70 hover:bg-turquoise-50 hover:text-turquoise-700'
                    }`}
                  >
                    <PlusIcon strokeWidth={2.6} className="size-4 shrink-0 text-turquoise-600" />
                    <span className="min-w-0 flex-1 break-words">
                      نوع موردنظر پیدا نشد؟ افزودن: «{trimmedQuery}»
                    </span>
                  </button>
                )}
              </li>
            </div>
          )}
        </ul>
      )}
    </div>
  );
}
