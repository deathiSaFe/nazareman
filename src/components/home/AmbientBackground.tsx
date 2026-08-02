import { BubbleIcon } from '@/components/icons';

/* Eight-pointed-star (girih) tile at near-invisible opacity */
const GIRIH_PATTERN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%2315433f' stroke-width='1'%3E%3Crect x='14' y='14' width='28' height='28'/%3E%3Crect x='14' y='14' width='28' height='28' transform='rotate(45 28 28)'/%3E%3Ccircle cx='28' cy='28' r='3.5'/%3E%3C/g%3E%3C/svg%3E";

function FloatingBubble({ className = '' }: { className?: string }) {
  return (
    <BubbleIcon
      strokeWidth={1.5}
      className={`absolute text-turquoise-600/20 motion-reduce:animate-none ${className}`}
    />
  );
}

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* texture — clears the central focal zone around the search */}
      <div
        className="absolute inset-0 opacity-[0.05] [mask-image:radial-gradient(130%_90%_at_50%_58%,transparent_18%,black_65%)]"
        style={{ backgroundImage: `url("${GIRIH_PATTERN}")`, backgroundSize: '56px 56px' }}
      />

      {/* soft light fields */}
      <div className="absolute -top-24 -start-24 size-96 animate-breathe rounded-full bg-turquoise-400/20 blur-3xl motion-reduce:animate-none" />
      <div className="absolute -bottom-32 -end-24 size-[26rem] animate-breathe rounded-full bg-saffron-400/15 blur-3xl [animation-delay:-6s] motion-reduce:animate-none" />

      {/* stage glow behind the search bar */}
      <div className="absolute left-1/2 top-[58%] h-72 w-[38rem] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-turquoise-300/25 blur-3xl" />

      {/* drifting opinion bubbles */}
      <FloatingBubble className="top-[24%] start-[6%] size-9 animate-float" />
      <FloatingBubble className="top-[15%] end-[16%] size-6 animate-float text-saffron-500/25 [animation-delay:-3s]" />
      <FloatingBubble className="bottom-[26%] end-[7%] hidden size-12 animate-float [animation-delay:-6s] sm:block" />
      <FloatingBubble className="bottom-[34%] start-[9%] hidden size-7 animate-float [animation-delay:-1.5s] sm:block" />
    </div>
  );
}