'use client';

import type { FormEvent } from 'react';
import { CheckIcon } from '@/components/icons';

interface ConfirmationFormProps {
  name: string;
  primaryType: string;
  secondaryTypes: string[];
  locationLabel: string;
  onSubmit: () => void;
  onEdit?: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  className?: string;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-[13px] font-medium text-ink-500">{label}</dt>
      <dd className="min-w-0 text-start text-[14px] font-semibold leading-6 text-ink-900">
        {value}
      </dd>
    </div>
  );
}

/**
 * Final confirmation before creating the page. Shows only a summary of what
 * the user selected — nothing to fill in, just «ایجاد صفحه».
 */
export function ConfirmationForm({
  name,
  primaryType,
  secondaryTypes,
  locationLabel,
  onSubmit,
  onEdit,
  isSubmitting = false,
  submitError = null,
  className = '',
}: ConfirmationFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <dl className="divide-y divide-ink-900/[0.06] rounded-[22px] bg-white px-5 py-2 ring-1 ring-ink-900/[0.07]">
        <SummaryRow label="نام صفحه" value={name} />
        <SummaryRow label="نوع اصلی" value={primaryType} />
        {secondaryTypes.length > 0 && (
          <SummaryRow
            label="انواع دیگر"
            value={secondaryTypes.join('، ')}
          />
        )}
        <SummaryRow label="محدوده فعالیت" value={locationLabel} />
      </dl>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 text-[13px] font-medium text-ink-500 underline underline-offset-4 transition-colors hover:text-turquoise-700"
        >
          بازگشت و ویرایش اطلاعات
        </button>
      )}

      {submitError && (
        <p role="alert" className="mt-4 text-sm font-bold text-red-600">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-turquoise-600 px-7 py-4 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-turquoise-700 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? 'در حال ایجاد...' : 'ایجاد صفحه'}
        <CheckIcon strokeWidth={2.6} className="size-5" />
      </button>
    </form>
  );
}
