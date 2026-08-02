import type { ActiveFilter } from '@/types/filters';
import { FilterChip } from './FilterChip';
import { TrashIcon } from '@/components/icons';

interface ActiveFilterChipsProps {
  filters: ActiveFilter[];
  onRemove?: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function ActiveFilterChips({ filters, onRemove, onClearAll, className = '' }: ActiveFilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="فیلترهای فعال">
      {filters.map((filter, index) => (
        <FilterChip
          key={filter.id}
          filter={filter}
          onRemove={onRemove}
          className="animate-pop-in motion-reduce:animate-none"
          style={{ animationDelay: `${index * 60}ms` }}
        />
      ))}

      {filters.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/15 bg-white/80 px-3 py-[7px] text-[12px] font-semibold leading-none text-ink-900/55 shadow-[0_2px_8px_-4px_rgba(21,67,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 active:translate-y-0 active:scale-95"
        >
          <TrashIcon strokeWidth={2.2} className="size-3.5" />
          پاک کردن همه فیلترها
        </button>
      )}
    </div>
  );
}