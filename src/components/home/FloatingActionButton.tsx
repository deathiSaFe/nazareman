import Link from 'next/link';

export default function FloatingActionButton() {
  return (
    <Link
      href="/add-topic"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-turquoise-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_-6px_rgba(26,99,93,0.5)] transition-all duration-200 hover:-translate-y-1 hover:bg-turquoise-700 hover:shadow-[0_14px_40px_-6px_rgba(26,99,93,0.55)] active:translate-y-0 active:scale-[0.96]"
      aria-label="افزودن موضوع جدید"
    >
      <svg
        className="size-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span>افزودن موضوع</span>
    </Link>
  );
}