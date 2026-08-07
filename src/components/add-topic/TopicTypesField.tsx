'use client';

import { useRef } from 'react';
import { XIcon } from '@/components/icons';
import type { SelectedTopicType, TopicTypeKind } from '@/types/topic';
import { TypeAutocomplete } from './TypeAutocomplete';

interface TopicTypesFieldProps {
  value: SelectedTopicType[];
  onChange: (types: SelectedTopicType[]) => void;
  /** Fired while typing so the parent can clear validation state. */
  onQueryChange?: () => void;
  className?: string;
}

const MAX_TYPES = 5;

const PRIMARY_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full bg-turquoise-700 py-[7px] ps-3 text-[13px] font-semibold leading-none text-white shadow-[0_2px_10px_-4px_rgba(21,67,63,0.35)]';

const SECONDARY_CHIP_CLASS =
  'inline-flex items-center gap-1.5 rounded-full bg-white py-[7px] ps-3 text-[13px] font-semibold leading-none text-ink-800 ring-1 ring-ink-900/10 shadow-[0_2px_10px_-4px_rgba(21,67,63,0.2)]';

export function TopicTypesField({
  value,
  onChange,
  onQueryChange,
  className = '',
}: TopicTypesFieldProps) {
  const canAddMore = value.length < MAX_TYPES;

  // The mobile keyboard scroll target: wraps the label AND the autocomplete,
  // so the whole section can be brought near the top of the visible viewport.
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleAdd = (label: string) => {
    const trimmed = label.trim();

    if (!trimmed) return;
    if (value.some((type) => type.label === trimmed)) return;

    const next: SelectedTopicType[] = [
      ...value,
      { label: trimmed, kind: value.length === 0 ? 'PRIMARY' : 'SECONDARY' },
    ];

    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (index < 0 || index >= value.length) return;

    const remaining = value.filter((_, itemIndex) => itemIndex !== index);

    // The first remaining type always becomes the primary. This means the
    // primary cannot be removed while it is the only type (its ✕ is hidden)
    // and removing it promotes the next one, so there is never no primary.
    const next: SelectedTopicType[] = remaining.map((type, itemIndex) => ({
      ...type,
      kind: (itemIndex === 0 ? 'PRIMARY' : 'SECONDARY') as TopicTypeKind,
    }));

    onChange(next);
  };

  return (
    <div className={className}>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {value.map((type, index) => {
            const isPrimary = type.kind === 'PRIMARY';
            const removable = value.length > 1 || !isPrimary;

            return (
              <span
                key={`${type.label}-${index}`}
                className={isPrimary ? PRIMARY_CHIP_CLASS : SECONDARY_CHIP_CLASS}
              >
                {isPrimary && (
                  <span
                    aria-hidden
                    className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-extrabold"
                  >
                    اصلی
                  </span>
                )}
                <span className="truncate">{type.label}</span>
                {removable && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    aria-label={`حذف نوع «${type.label}»`}
                    className={`grid size-5 shrink-0 place-items-center rounded-full transition-colors ${
                      isPrimary
                        ? 'text-white/75 hover:bg-white/25 hover:text-white'
                        : 'text-ink-900/40 hover:bg-ink-900 hover:text-white'
                    }`}
                  >
                    <XIcon strokeWidth={2.6} className="size-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      <div ref={sectionRef}>
        <span className="mb-2 block text-[13px] font-bold text-ink-900">
          {value.length === 0 ? 'نوع موضوع' : 'افزودن نوع دیگر'}
        </span>

        {canAddMore ? (
          <TypeAutocomplete
            value=""
            onChange={handleAdd}
            onQueryChange={onQueryChange}
            sectionRef={sectionRef}
          />
        ) : (
          <p className="mt-2 text-[13px] font-medium text-ink-500">
            حداکثر {MAX_TYPES} نوع می‌توانید برای یک موضوع انتخاب کنید.
          </p>
        )}
      </div>
    </div>
  );
}
