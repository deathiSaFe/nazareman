'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { XIcon } from '@/components/icons';

export interface TourAction {
  label: string;
  onClick: () => void;
}

export interface TourStepContent {
  targetId: string | null;
  title: string;
  message: string;
  /** e.g. «مرحله ۳ از ۷» — null when no numbered stage applies. */
  stepLabel: string | null;
  actions: TourAction[];
}

interface TourOverlayProps {
  step: TourStepContent;
  /** Current profile-completion percent (0-100) shown in the popup. */
  progress: number;
  /** Close/skip the whole tour. */
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Guided onboarding tour overlay for the Topic page.
 *
 * A semi-transparent dark layer covers the page and a "spotlight" (a CSS
 * box-shadow cutout) keeps the active target bright. A compact popup explains
 * the step and offers actions. The overlay never intercepts pointer events, so
 * the target and the rest of the page stay usable; the popup is the only
 * interactive element.
 *
 * Geometry is recomputed on scroll, resize and Visual-Viewport changes (i.e.
 * when the mobile keyboard opens), and the popup is placed in whichever
 * direction has room — below, above, or anchored to the visible bottom so it
 * never hides behind the keyboard.
 */
export function TourOverlay({ step, progress, onClose }: TourOverlayProps) {
  const [spot, setSpot] = useState<Rect | null>(null);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const computeGeometry = useCallback(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    const vvTop = vv?.offsetTop ?? 0;
    const vvHeight = vv?.height ?? window.innerHeight;
    const vw = window.innerWidth;

    const target = step.targetId ? document.getElementById(step.targetId) : null;

    if (!target) {
      // Final state — no spotlight; anchor the popup to the visible bottom.
      setSpot(null);
      const ph = popupRef.current?.offsetHeight ?? 200;
      const pw = popupRef.current?.offsetWidth ?? Math.min(320, vw - 24);
      const top = Math.max(vvTop + 12, vvTop + vvHeight - ph - 24);
      const left = Math.max(12, (vw - pw) / 2);
      setPopupPos((prev) =>
        prev && prev.top === top && prev.left === left ? prev : { top, left }
      );
      return;
    }

    const rect = target.getBoundingClientRect();
    const nextSpot: Rect = {
      top: rect.top - vvTop,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    setSpot((prev) =>
      prev &&
      prev.top === nextSpot.top &&
      prev.left === nextSpot.left &&
      prev.width === nextSpot.width &&
      prev.height === nextSpot.height
        ? prev
        : nextSpot
    );

    const pop = popupRef.current;
    if (!pop) return;

    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const gap = 14;

    // Keep the popup inside the viewport horizontally.
    const left = Math.max(12, Math.min(nextSpot.left + nextSpot.width - pw, vw - pw - 12));

    const vBottom = vvTop + vvHeight;
    const below = vBottom - (nextSpot.top + nextSpot.height);
    const above = nextSpot.top - vvTop;

    let top: number;
    if (below >= ph + gap) {
      top = nextSpot.top + nextSpot.height + gap;
    } else if (above >= ph + gap) {
      top = nextSpot.top - ph - gap;
    } else {
      top = Math.max(vvTop + gap, vBottom - ph - gap);
    }

    setPopupPos((prev) =>
      prev && prev.top === top && prev.left === left ? prev : { top, left }
    );
  }, [step.targetId]);

  // On step change, scroll the target into a comfortable position, then measure
  // once the smooth scroll has settled.
  useLayoutEffect(() => {
    const target = step.targetId ? document.getElementById(step.targetId) : null;

    if (!target) {
      const raf = requestAnimationFrame(computeGeometry);
      return () => cancelAnimationFrame(raf);
    }

    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const timer = window.setTimeout(computeGeometry, 380);

    return () => window.clearTimeout(timer);
  }, [step.targetId, computeGeometry]);

  // Keep geometry in sync with scroll / resize / keyboard (Visual Viewport).
  useEffect(() => {
    let raf = 0;

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeGeometry);
    };

    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);

    const vv = window.visualViewport;
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);

    return () => {
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
    };
  }, [computeGeometry]);

  // Re-measure whenever the popup content changes height.
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(computeGeometry);
    return () => cancelAnimationFrame(raf);
  }, [computeGeometry, step.title, step.message, step.stepLabel, step.actions]);

  return (
    <>
      {/* Dark overlay + spotlight (never intercepts pointer events). */}
      <div className="pointer-events-none fixed inset-0 z-40">
        {spot && (
          <div
            className="absolute rounded-[20px] transition-[top,left,width,height] duration-300 ease-out"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              boxShadow:
                '0 0 0 9999px rgba(8,24,20,0.55), 0 0 0 2px rgba(31,122,114,0.6)',
            }}
          />
        )}
      </div>

      {/* Tour popup */}
      <div
        ref={popupRef}
        className="fixed z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl bg-white p-4 shadow-[0_24px_60px_-20px_rgba(8,24,20,0.5)] ring-1 ring-ink-900/10 transition-[top,left,opacity] duration-300 ease-out"
        style={{
          top: popupPos?.top ?? 12,
          left: popupPos?.left ?? 12,
          opacity: popupPos ? 1 : 0,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن راهنمای صفحه"
          title="بستن راهنما"
          className="absolute end-2 top-2 grid size-7 place-items-center rounded-full text-ink-900/40 transition-colors hover:bg-ink-900/5 hover:text-ink-900/70"
        >
          <XIcon strokeWidth={2.4} className="size-3.5" />
        </button>

        <div key={step.title} className="animate-[tourfade_0.25s_ease-out]">
          <p className="text-[13px] font-bold text-ink-900">{step.title}</p>
          <p className="mt-1 text-[12px] leading-5 text-ink-600">{step.message}</p>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-900/10">
              <div
                className="h-full rounded-full bg-turquoise-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {step.stepLabel && (
              <span className="shrink-0 text-[11px] font-semibold text-ink-500">
                {step.stepLabel}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {step.actions.map((action, index) =>
              index === 0 ? (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="rounded-full bg-turquoise-600 px-4 py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-turquoise-700"
                >
                  {action.label}
                </button>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-ink-600 ring-1 ring-ink-900/15 transition-colors hover:bg-ink-900/5"
                >
                  {action.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
