import { PenIcon } from '@/components/icons';

interface SubmitOpinionFabProps {
  className?: string;
}

export function SubmitOpinionFab({ className = '' }: SubmitOpinionFabProps) {
  return (
    <button
      type="button"
      aria-label="ثبت نظر جدید"
      title="ثبت نظر"
      className={`group relative size-[5.25rem] focus-visible:outline-none md:size-24 ${className}`}
    >
      {/* soft breathing glow — attention without noise */}
      <span
        aria-hidden
        className="absolute -inset-2 animate-breathe rounded-full bg-saffron-400/30 blur-xl motion-reduce:animate-none"
      />

      {/* bubble tail */}
      <span
        aria-hidden
        className="absolute bottom-1 start-8 size-[18px] rotate-45 rounded-[5px] bg-saffron-600 shadow-lg shadow-saffron-700/30 transition-transform duration-300 group-hover:translate-y-0.5 md:start-9"
      />

      {/* bubble body — layered elevation */}
      <span
        className="absolute inset-0 grid place-items-center rounded-full
                   bg-gradient-to-b from-saffron-200 via-saffron-400 to-saffron-600 text-ink-900
                   ring-1 ring-white/30 ring-inset
                   shadow-[0_8px_20px_-6px_rgba(176,90,23,0.45),0_18px_40px_-12px_rgba(176,90,23,0.4)]
                   transition-all duration-300 ease-out
                   group-hover:-translate-y-1 group-hover:shadow-[0_14px_28px_-6px_rgba(176,90,23,0.5),0_26px_55px_-12px_rgba(176,90,23,0.45)]
                   group-active:translate-y-0 group-active:scale-95 group-active:shadow-[0_6px_14px_-6px_rgba(176,90,23,0.5)]
                   focus-visible:ring-2 focus-visible:ring-turquoise-700"
      >
        {/* top sheen */}
        <span
          aria-hidden
          className="absolute inset-x-4 top-2.5 h-1/3 rounded-full bg-gradient-to-b from-white/45 to-transparent blur-[1px]"
        />

        <span className="relative flex flex-col items-center pb-1.5">
          <PenIcon
            strokeWidth={2.2}
            className="size-[18px] -scale-x-100 transition-transform duration-300 group-hover:-rotate-[14deg] group-hover:scale-110 md:size-5"
          />
          <span className="mt-1 font-display text-base leading-none md:text-[17px]">ثبت نظر</span>
        </span>
      </span>
    </button>
  );
}