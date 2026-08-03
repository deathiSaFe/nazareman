import type { FormEvent, ReactNode } from 'react';
import { MapPinIcon, SendIcon } from '@/components/icons';

const inputClass =
  'w-full rounded-2xl bg-white px-4 py-3.5 text-[15px] font-medium text-ink-900 outline-none ring-1 ring-ink-900/10 transition-all duration-200 placeholder:font-normal placeholder:text-ink-900/30 focus:shadow-[0_10px_28px_-12px_rgba(26,99,93,0.35)] focus:ring-2 focus:ring-turquoise-600/70';

function Field({ label, optional = false, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-bold text-ink-900">{label}</span>
        {optional && <span className="text-[11px] font-medium text-ink-900/40">اختیاری</span>}
      </span>
      {children}
    </label>
  );
}

interface TopicDetailsFormProps {
  name: string;
  onNameChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  showCityField: boolean;
  onSubmit: () => void;
  className?: string;
}

export function TopicDetailsForm({
  name,
  onNameChange,
  city,
  onCityChange,
  description,
  onDescriptionChange,
  showCityField,
  onSubmit,
  className = '',
}: TopicDetailsFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    // TODO(validation): add inline Persian error messages (e.g. empty name) before enabling real submission.
    <form onSubmit={handleSubmit} noValidate className={className}>
      <div className="space-y-5">
        <Field label="نام موضوع">
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="مثلاً: کافه کتاب، خیابان انقلاب"
            className={inputClass}
          />
        </Field>

        {showCityField && (
          <Field label="شهر" optional>
            {/* TODO(city-picker): replace with a province/city picker backed by Neshan Maps data. */}
            <div className="relative">
              <MapPinIcon className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-900/30" />
              <input
                type="text"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="مثلاً: تهران"
                className={`${inputClass} ps-11`}
              />
            </div>
          </Field>
        )}

        <Field label="توضیح کوتاه" optional>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="یک خط درباره این موضوع بنویسید…"
            className={`${inputClass} resize-none leading-7`}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-[22px] bg-gradient-to-b from-turquoise-600 via-turquoise-700 to-turquoise-900 py-4 font-display text-lg text-white
                   ring-1 ring-white/15 ring-inset shadow-[0_14px_30px_-12px_rgba(10,39,36,0.5),0_28px_60px_-24px_rgba(26,99,93,0.45)]
                   transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(10,39,36,0.55),0_36px_80px_-24px_rgba(26,99,93,0.5)]
                   active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 md:text-xl"
      >
        ارسال برای بررسی
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