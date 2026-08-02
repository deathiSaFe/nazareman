import { SlidersIcon } from '@/components/icons';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const toFaDigits = (value: number | string) =>
  String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

interface FilterButtonProps {
  activeCount?: number;
  onClick?: () => void;
  className?: string;
}

export function FilterButton({ activeCount = 0, onClick, className = '' }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={
        activeCount > 0
          ? `فیلترهای جست‌وجو — ${toFaDigits(activeCount)} فیلتر فعال`
          : 'فیلترهای جست‌وجو'
      }
      className={`relative flex shrink-0 items-center gap-2 pe-5 ps-4 text-sm font-bold text-ink-900/65
                  transition-colors duration-200 hover:bg-turquoise-50 hover:text-turquoise-800
                  active:bg-turquoise-100/80 focus-visible:bg-turquoise-50 focus-visible:outline-none ${className}`}
    >
      <SlidersIcon strokeWidth={2.2} className="size-[18px]" />
      <span>فیلتر</span>

      {activeCount > 0 && (
        <span className="grid size-[18px] animate-pop-in place-items-center rounded-full bg-saffron-400 text-[10px] font-extrabold text-ink-900 shadow-sm ring-2 ring-white">
          {toFaDigits(activeCount)}
        </span>
      )}
    </button>
  );
}