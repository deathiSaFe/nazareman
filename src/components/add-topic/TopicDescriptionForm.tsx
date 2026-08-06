'use client';

import { useState, type FormEvent } from 'react';
import { SendIcon } from '@/components/icons';

interface TopicDescriptionFormProps {
  name: string;
  /** Ordered type labels — the primary type comes first. */
  types: string[];
  locationLabel: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onEdit?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  className?: string;
}

const MIN_DESCRIPTION_LENGTH = 20;

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-[13px] font-medium text-ink-500">{label}</dt>
      <dd className="min-w-0 text-start text-[14px] font-semibold leading-6 text-ink-900">
        {value}
      </dd>
    </div>
  );
}

export function TopicDescriptionForm({
  name,
  types,
  locationLabel,
  description,
  onDescriptionChange,
  onSubmit,
  onEdit,
  isSubmitting = false,
  submitError = null,
  className = '',
}: TopicDescriptionFormProps) {
  const [touched, setTouched] = useState(false);

  const trimmedDescription = description.trim();
  const tooShort =
    trimmedDescription.length > 0 &&
    trimmedDescription.length < MIN_DESCRIPTION_LENGTH;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <dl className="space-y-3 rounded-[22px] bg-white p-5 ring-1 ring-ink-900/[0.07]">
        <SummaryRow label="نام موضوع" value={name} />
        <SummaryRow
          label="نوع موضوع"
          value={types.filter(Boolean).join('، ') || 'بدون نوع'}
        />
        <SummaryRow
          label="محدوده فعالیت"
          value={locationLabel}
        />
      </dl>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-3 text-[13px] font-medium text-ink-500 underline underline-offset-4 transition-colors hover:text-turquoise-700"
        >
          ویرایش اطلاعات
        </button>
      )}

      <div className="mt-8">
        <label htmlFor="topic-description" className="block">
          <span className="text-[13px] font-bold text-ink-900">
            توضیح کوتاه
          </span>
          <span className="mt-1 block text-[12px] leading-5 text-ink-500">
            یک پاراگراف درباره این موضوع بنویسید تا دیگران بهتر متوجه شوند درباره
            چه چیزی نظر می‌دهند. ({MIN_DESCRIPTION_LENGTH} حرف به بالا)
          </span>
        </label>

        <textarea
          id="topic-description"
          value={description}
          onChange={(event) => {
            onDescriptionChange(event.target.value);
            setTouched(true);
          }}
          rows={5}
          maxLength={300}
          placeholder="مثلاً: بیش از ده سال است در این محله خدمات تعمیرات ارائه می‌دهد و کیفیت کار آن زبانزد است…"
          aria-describedby="topic-description-help"
          className="mt-3 w-full resize-none rounded-[22px] bg-white p-5 text-[15px] leading-7 text-ink-900 caret-turquoise-700 outline-none ring-1 ring-ink-900/10 transition-shadow duration-200 placeholder:font-normal placeholder:text-ink-900/30 focus:ring-2 focus:ring-turquoise-600/70 focus:shadow-[0_10px_28px_-12px_rgba(26,99,93,0.35)]"
        />

        {touched && tooShort && (
          <p
            id="topic-description-help"
            role="alert"
            className="mt-2 text-[13px] font-semibold text-red-600"
          >
            توضیح باید حداقل {MIN_DESCRIPTION_LENGTH} حرف باشد.
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm font-bold text-red-600">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-[22px] bg-gradient-to-b from-turquoise-600 via-turquoise-700 to-turquoise-900 py-4 font-display text-lg text-white
                   ring-1 ring-white/15 ring-inset shadow-[0_14px_30px_-12px_rgba(10,39,36,0.5),0_28px_60px_-24px_rgba(26,99,93,0.45)]
                   transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(10,39,36,0.55),0_36px_80px_-24px_rgba(26,99,93,0.5)]
                   active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400
                   disabled:pointer-events-none disabled:opacity-40 md:text-xl"
      >
        {isSubmitting ? 'در حال ارسال...' : 'ارسال برای بررسی'}
        <SendIcon
          strokeWidth={2.2}
          className="size-5 -scale-x-100 text-white/80 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-saffron-300"
        />
      </button>

      <p className="mt-3 text-center text-[12px] leading-6 text-ink-900/40">
        موضوع شما پس از بررسی مدیریت منتشر می‌شود.
      </p>
    </form>
  );
}
