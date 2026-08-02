import { ArrowLeftIcon, PlusIcon } from '@/components/icons';

interface AddTopicButtonProps {
  className?: string;
}

export function AddTopicButton({ className = '' }: AddTopicButtonProps) {
  return (
    <button
      type="button"
      // TODO(topic): open the "add new topic" flow — no behavior yet.
      className={`group relative inline-flex items-center gap-3 whitespace-nowrap rounded-[26px]
                  bg-gradient-to-br from-turquoise-600 via-turquoise-700 to-turquoise-900 text-white
                  py-3.5 pe-5 ps-3 ring-1 ring-white/15 ring-inset
                  shadow-[0_14px_30px_-12px_rgba(10,39,36,0.55),0_28px_60px_-24px_rgba(26,99,93,0.5)]
                  transition-all duration-300 ease-out
                  hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(10,39,36,0.6),0_36px_80px_-24px_rgba(26,99,93,0.55)]
                  active:translate-y-0 active:scale-[0.98]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400
                  md:gap-4 md:py-4 md:pe-7 md:ps-4 ${className}`}
    >
      {/* breathing aura */}
      <span
        aria-hidden
        className="absolute -inset-2.5 animate-breathe rounded-[32px] bg-turquoise-500/25 blur-2xl motion-reduce:animate-none"
      />

      {/* top sheen */}
      <span
        aria-hidden
        className="absolute inset-x-5 top-1.5 h-2/5 rounded-full bg-gradient-to-b from-white/25 to-transparent blur-[2px]"
      />

      {/* plus medallion — spins into saffron on hover */}
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25 transition-all duration-300 group-hover:rotate-90 group-hover:bg-saffron-400 group-hover:text-ink-900 group-hover:ring-saffron-300 md:size-14">
        <PlusIcon strokeWidth={2.6} className="size-5 md:size-7" />
      </span>

      <span className="relative font-display text-base leading-none md:text-[21px]">
        افزودن موضوع جدید برای نظردهی
      </span>

      {/* forward arrow (RTL → points left), appears from sm up */}
      <ArrowLeftIcon
        strokeWidth={2.4}
        className="relative hidden size-5 shrink-0 text-white/60 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-saffron-300 sm:block md:size-6"
      />
    </button>
  );
}