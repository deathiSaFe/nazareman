import Link from 'next/link';
import { PlusIcon } from '@/components/icons';

interface AddTopicButtonProps {
  className?: string;
}

export function AddTopicButton({ className = '' }: AddTopicButtonProps) {
  return (
    <Link
      href="/add-topic"
      aria-label="افزودن موضوع جدید برای نظردهی"
      className={`group inline-flex items-center gap-3 whitespace-nowrap rounded-full
                  bg-gradient-to-b from-turquoise-600 via-turquoise-700 to-turquoise-900 py-3 pe-7 ps-3
                  font-display text-base leading-none text-white ring-1 ring-white/20 ring-inset
                  shadow-[0_10px_26px_-10px_rgba(10,39,36,0.55),0_20px_44px_-18px_rgba(26,99,93,0.5)]
                  transition-all duration-300 ease-out
                  hover:-translate-y-1 hover:shadow-[0_16px_34px_-10px_rgba(10,39,36,0.6),0_28px_60px_-18px_rgba(26,99,93,0.55)]
                  active:translate-y-0 active:scale-[0.97]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400
                  md:gap-3.5 md:py-3.5 md:pe-8 md:ps-3.5 md:text-[17px] ${className}`}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 transition-all duration-300 group-hover:rotate-90 group-hover:bg-saffron-400 group-hover:text-ink-900 group-hover:ring-saffron-300 md:size-10">
        <PlusIcon strokeWidth={2.6} className="size-5" />
      </span>
      افزودن موضوع جدید برای نظردهی
    </Link>
  );
}