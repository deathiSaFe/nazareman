import Link from 'next/link';
import { ArrowLeftIcon, MapPinIcon, SearchIcon } from '@/components/icons';
import { TOPIC_TYPES, topicHref, type TopicSearchResult } from '@/types/topic';

interface SimilarTopicsPanelProps {
  results: TopicSearchResult[];
  /** Future: analytics / dedupe tracking when the user picks an existing topic. */
  onSelect?: (result: TopicSearchResult) => void;
  className?: string;
}

export function SimilarTopicsPanel({ results, onSelect, className = '' }: SimilarTopicsPanelProps) {
  /* ——— results found: existing topics become the primary focus ——— */
  if (results.length > 0) {
    return (
      <section className={`rounded-[22px] bg-turquoise-50 p-4 ring-1 ring-turquoise-600/25 md:p-5 ${className}`}>
        {/* TODO(duplicate-search): results will arrive here from the search endpoint — nothing is mocked yet. */}
        <h3 className="text-[15px] font-extrabold text-turquoise-900">آیا منظورتان یکی از این موارد است؟</h3>
        <p className="mt-1.5 text-[13px] leading-6 text-turquoise-900/60">
          اگر موضوع شما قبلاً ثبت شده، به‌جای ساختن موضوع تکراری، آن را انتخاب کنید.
        </p>

        <ul className="mt-3 space-y-2">
          {results.map((result) => {
            const emoji = TOPIC_TYPES.find((t) => t.id === result.type)?.emoji ?? '📂';
            return (
              <li key={result.id}>
                {/* Links to the permanent topic page — the /topic/[id] route comes later. */}
                <Link
                  href={topicHref(result)}
                  onClick={() => onSelect?.(result)}
                  className="group flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-turquoise-600/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(26,99,93,0.4)] hover:ring-turquoise-600/40"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-turquoise-600/10 text-[20px] leading-none">
                    {emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink-900">{result.name}</span>
                    {result.city && (
                      <span className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-900/45">
                        <MapPinIcon className="size-3" strokeWidth={2.2} />
                        {result.city}
                      </span>
                    )}
                  </span>
                  <ArrowLeftIcon
                    strokeWidth={2.2}
                    className="size-4 shrink-0 text-turquoise-600/50 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:text-turquoise-700"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  /* ——— searched, nothing found ——— */
  return (
    <section className={`rounded-[22px] border border-dashed border-ink-900/15 bg-white/70 p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <SearchIcon strokeWidth={2.2} className="size-4 text-ink-900/35" />
        <h3 className="text-[13px] font-extrabold text-ink-900/70">موضوعات مشابه</h3>
      </div>
      <p className="mt-3 text-[13px] leading-6 text-ink-900/45">مورد مشابهی پیدا نشد.</p>
    </section>
  );
}