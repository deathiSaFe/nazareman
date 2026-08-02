import type { CSSProperties } from 'react';
import { XIcon } from '@/components/icons';
import type { ActiveFilter } from '@/types/filters';

interface FilterChipProps {
  filter: ActiveFilter;
  onRemove?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export function FilterChip({ filter, onRemove, className = '', style }: FilterChipProps) {
  const removable = filter.removable !== false && !!onRemove;

  const tone = filter.emphasized
    ? 'bg-turquoise-700 text-white ring-turquoise-800/40'
    : 'bg-white text-ink-800 ring-ink-900/10 hover:-translate-y-px hover:shadow-[0_6px_14px_-6px_rgba(26,99,93,0.35)] hover:ring-turquoise-600/40';

  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 rounded-full py-[7px] pe-1.5 ps-3 text-[13px] font-semibold leading-none
                  shadow-[0_2px_10px_-4px_rgba(21,67,63,0.25)] ring-1 transition-all duration-200 ${tone} ${className}`}
    >
      {filter.icon && (
        <span className={`[&>svg]:size-3.5 ${filter.emphasized ? 'text-turquoise-100' : 'text-turquoise-700/80'}`}>
          {filter.icon}
        </span>
      )}

      {filter.label}

      {removable && (
        <button
          type="button"
          onClick={() => onRemove?.(filter.id)}
          aria-label={`حذف فیلتر «${filter.label}»`}
          className={`grid size-5 shrink-0 place-items-center rounded-full transition-all duration-200 active:scale-90 ${
            filter.emphasized
              ? 'text-white/75 hover:bg-white/25 hover:text-white'
              : 'text-ink-900/40 hover:bg-ink-900 hover:text-white'
          }`}
        >
          <XIcon strokeWidth={2.6} className="size-3" />
        </button>
      )}
    </span>
  );
}