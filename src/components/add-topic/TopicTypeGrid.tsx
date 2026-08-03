import { TOPIC_TYPES, type TopicType } from '@/types/topic';
import { TopicTypeCard } from './TopicTypeCard';

interface TopicTypeGridProps {
  value: TopicType | null;
  onChange: (type: TopicType) => void;
  className?: string;
}

export function TopicTypeGrid({ value, onChange, className = '' }: TopicTypeGridProps) {
  return (
    <div
      role="radiogroup"
      aria-label="نوع موضوع"
      className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${className}`}
    >
      {TOPIC_TYPES.map((option) => (
        <TopicTypeCard
          key={option.id}
          option={option}
          selected={value === option.id}
          onSelect={() => onChange(option.id)}
        />
      ))}
    </div>
  );
}