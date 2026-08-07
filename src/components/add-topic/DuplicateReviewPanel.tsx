'use client';

import { useState } from 'react';
import { CheckIcon, MapPinIcon, PlusIcon } from '@/components/icons';
import type { DuplicateTopic } from '@/types/topic';

/** Exactly what the user just entered — shown for easy comparison. */
export interface UserEntry {
  name: string;
  primaryType: string;
  secondaryTypes: string[];
  locationLabel: string;
}

interface DuplicateReviewPanelProps {
  duplicates: DuplicateTopic[];
  onSelect: (duplicate: DuplicateTopic) => void;
  onContinue: () => void;
  onBack?: () => void;
  userEntry: UserEntry;
  className?: string;
}

function EntryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[13px] font-medium text-ink-500">{label}</dt>
      <dd className="min-w-0 text-start text-[14px] font-semibold leading-6 text-ink-900">
        {value}
      </dd>
    </div>
  );
}

export function DuplicateReviewPanel({
  duplicates,
  onSelect,
  onContinue,
  onBack,
  userEntry,
  className = '',
}: DuplicateReviewPanelProps) {
  const [selectedId, setSelectedId] = useState(duplicates[0]?.id ?? '');

  const selected =
    duplicates.find((duplicate) => duplicate.id === selectedId) ?? duplicates[0];

  return (
    <section className={className}>
      {/* ——— The user's own entry, shown first for comparison ——— */}
      <section
        aria-label="موضوعی که شما می‌خواهید اضافه کنید"
        className="rounded-[22px] bg-ink-900/[0.03] px-5 py-4 ring-1 ring-ink-900/[0.06]"
      >
        <h2 className="text-[13px] font-bold text-ink-500">
          موضوعی که شما می‌خواهید اضافه کنید
        </h2>

        <dl className="mt-3 space-y-2.5">
          <EntryRow label="نام" value={userEntry.name} />
          <EntryRow label="نوع اصلی" value={userEntry.primaryType} />
          {userEntry.secondaryTypes.length > 0 && (
            <EntryRow label="انواع دیگر" value={userEntry.secondaryTypes.join('، ')} />
          )}
          <EntryRow label="محدوده فعالیت" value={userEntry.locationLabel} />
        </dl>
      </section>

      {/* ——— Existing possible duplicates ——— */}
      <h2 className="mt-10 font-display text-2xl text-ink-900">
        آیا منظور شما یکی از این موارد است؟
      </h2>

      <p className="mt-2 text-sm leading-6 text-ink-600">
        برای جلوگیری از ایجاد موضوع تکراری، چند مورد مشابه پیدا کردیم.
      </p>

      <div className="mt-6 space-y-3" role="radiogroup" aria-label="موضوعات مشابه">
        {duplicates.map((duplicate) => {
          const isSelected = duplicate.id === selected?.id;

          return (
            <button
              key={duplicate.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedId(duplicate.id)}
              className={`block w-full rounded-[22px] p-4 text-start ring-1 transition-all duration-200 ${
                isSelected
                  ? 'bg-turquoise-50 ring-2 ring-turquoise-600'
                  : 'bg-white ring-ink-900/[0.08] hover:ring-turquoise-600/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[17px] leading-6 text-ink-900">
                  {duplicate.name}
                </h3>

                <span className="shrink-0 rounded-full bg-turquoise-600/10 px-3 py-1 text-[12px] font-bold text-turquoise-700">
                  {duplicate.types[0] ?? 'بدون نوع'}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
                {duplicate.types.length > 1 && (
                  <span className="text-[12px] text-ink-400">
                    {duplicate.types.slice(1).join('، ')}
                  </span>
                )}

                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="size-3.5" strokeWidth={2.2} />
                  {duplicate.locationLabel}
                </span>

                {duplicate.status === 'APPROVED' ? (
                  <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[12px] font-bold text-emerald-700">
                    تأییدشده
                  </span>
                ) : (
                  <span className="rounded-full bg-saffron-500/10 px-2.5 py-0.5 text-[12px] font-bold text-saffron-700">
                    در انتظار بررسی
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-turquoise-600 px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-turquoise-700 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
        >
          <CheckIcon strokeWidth={2.6} className="size-5" />
          این همان مورد است
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-ink-900 ring-1 ring-ink-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:ring-turquoise-600/50 hover:text-turquoise-700 active:translate-y-0 active:scale-[0.97]"
        >
          <PlusIcon strokeWidth={2.6} className="size-5" />
          هیچ‌کدام نیست، ادامه می‌دهم
        </button>
      </div>

      {onBack && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium text-ink-500 underline underline-offset-4 transition-colors hover:text-turquoise-700"
          >
            ویرایش اطلاعات موضوع
          </button>
        </div>
      )}
    </section>
  );
}
