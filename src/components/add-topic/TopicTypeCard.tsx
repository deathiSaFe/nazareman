import { CheckIcon } from '@/components/icons';
import type { TopicTypeOption } from '@/types/topic';

interface TopicTypeCardProps {
  option: TopicTypeOption;
  selected: boolean;
  onSelect: () => void;
}

export function TopicTypeCard({ option, selected, onSelect }: TopicTypeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex min-h-[108px] flex-col items-start justify-between gap-3 rounded-3xl p-4 text-start transition-all duration-200 active:scale-[0.98]
        ${
          selected
            ? 'bg-turquoise-50 ring-2 ring-turquoise-600 shadow-[0_10px_24px_-10px_rgba(26,99,93,0.4)]'
            : 'bg-white ring-1 ring-ink-900/[0.07] shadow-[0_4px_14px_-8px_rgba(21,67,63,0.2)] hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-10px_rgba(21,67,63,0.3)] hover:ring-turquoise-600/40'
        }`}
    >
      {selected && (
        <span className="absolute end-3 top-3 grid size-6 animate-pop-in place-items-center rounded-full bg-turquoise-600 text-white shadow-sm">
          <CheckIcon strokeWidth={3} className="size-3.5" />
        </span>
      )}

      <span
        className={`grid size-12 place-items-center rounded-2xl text-[26px] leading-none transition-colors ${
          selected ? 'bg-white ring-1 ring-turquoise-600/30' : 'bg-ink-900/[0.04]'
        }`}
      >
        {option.emoji}
      </span>

      <span className={`text-[13.5px] font-bold leading-6 ${selected ? 'text-turquoise-900' : 'text-ink-900/80'}`}>
        {option.label}
      </span>
    </button>
  );
}