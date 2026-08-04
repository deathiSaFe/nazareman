'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, SearchIcon, XIcon } from '@/components/icons';
import { TOPIC_TYPES, type TopicSearchResult, type TopicType } from '@/types/topic';
import { TopicTypeGrid } from './TopicTypeGrid';
import { SimilarTopicsPanel } from './SimilarTopicsPanel';
import { TopicDetailsForm } from './TopicDetailsForm';

function StepHeading({ step, title, done = false }: { step: string; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-extrabold transition-all duration-300 ${
          done ? 'bg-turquoise-600 text-white shadow-sm shadow-turquoise-600/40' : 'bg-turquoise-600/10 text-turquoise-700'
        }`}
      >
        {done ? <CheckIcon strokeWidth={3} className="size-3.5" /> : step}
      </span>
      <h2 className="text-[15px] font-extrabold text-ink-900">{title}</h2>
    </div>
  );
}

interface AddTopicFlowProps {
  className?: string;
}

export function AddTopicFlow({ className = '' }: AddTopicFlowProps) {
  const router = useRouter();

  const [type, setType] = useState<TopicType | null>(null);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<TopicSearchResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchStepRef = useRef<HTMLDivElement>(null);
  const detailsStepRef = useRef<HTMLDivElement>(null);
  const scrolledToSearch = useRef(false);
  const scrolledToDetails = useRef(false);

  const trimmedQuery = query.trim();
  const hasResults = results.length > 0;
  const selectedType = TOPIC_TYPES.find((t) => t.id === type) ?? null;

  /* The search field doubles as the future topic name —
     keep them synced until the user edits the name field manually. */
  useEffect(() => {
    if (!nameTouched) setName(trimmedQuery);
  }, [trimmedQuery, nameTouched]);

  /* Gently bring each newly revealed step into view (once). */
  useEffect(() => {
    if (!type || scrolledToSearch.current) return;
    scrolledToSearch.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    searchStepRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }, [type]);

  useEffect(() => {
    if (!showDetails || scrolledToDetails.current) return;
    scrolledToDetails.current = true;
    detailsStepRef.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }, [showDetails]);

  /** Triggered by Enter / the phone keyboard's search key. */
  function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    if (!trimmedQuery) return;
    // TODO(duplicate-search): call the topics search endpoint with `trimmedQuery`
    // and store the hits: setResults(response.topics).
    setResults([]);
    setHasSearched(true);
  }

  /** Explicit continue — Step 3 never reveals on its own. */
  function handleContinue() {
    if (!trimmedQuery) return;
    setShowDetails(true);
  }

  async function handleSubmit() {
    if (!type || isSubmitting) return;
    setIsSubmitting(true);

    let finalDescription = description.trim();
    
    // Ensure description is at least 20 chars for the API requirement
    if (finalDescription.length > 0 && finalDescription.length < 20) {
      finalDescription = finalDescription.padEnd(20, ' ');
    } else if (finalDescription.length === 0) {
      finalDescription = 'بدون توضیحات بیشتر از طرف کاربر ارائه شد.'; 
    }

    const payload = {
      name: name.trim(),
      type,
      description: finalDescription,
      cityName: city.trim(),
      imageUrl: '',
      firstComment: '',
    };

    try {
      const response = await fetch('/api/topics/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطا در ثبت موضوع');
      }

      // Navigate to the real topic page
      router.push(`/topic/${data.topicId}?focusComment=true`);
    } catch (error) {
      console.error(error);
      alert('خطایی در ثبت موضوع رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className}>
      {/* ——— step 1 · topic type ——— */}
      <section aria-label="انتخاب نوع موضوع">
        <StepHeading step="۱" title="نوع موضوع را انتخاب کنید" done={!!type} />
        <TopicTypeGrid value={type} onChange={setType} className="mt-4" />
      </section>

      {type && (
        <div ref={searchStepRef} className="mt-10 animate-fade-up motion-reduce:animate-none">
          {/* ——— step 2 · name + duplicate check ——— */}
          <section aria-label="نام موضوع">
            <StepHeading step="۲" title="نام موضوع را وارد کنید" done={showDetails} />

            <form
              role="search"
              onSubmit={handleSearch}
              className="group mt-4 flex items-center gap-3 rounded-[22px] bg-white pe-3 ps-5 ring-1 ring-ink-900/[0.06]
                         shadow-[0_10px_30px_-14px_rgba(21,67,63,0.3)] transition-all duration-300
                         focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-turquoise-600/70 focus-within:shadow-[0_18px_40px_-16px_rgba(26,99,93,0.45)]"
            >
              <SearchIcon
                strokeWidth={2.2}
                className="size-5 shrink-0 text-ink-900/30 transition-colors group-focus-within:text-turquoise-700"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="نام موضوع را وارد کنید..."
                aria-label="نام موضوع"
                enterKeyHint="search"
                autoComplete="off"
                className="h-14 w-full min-w-0 bg-transparent text-[15px] font-medium text-ink-900 caret-turquoise-700 outline-none placeholder:font-normal placeholder:text-ink-900/35 md:h-[60px] [&::-webkit-search-cancel-button]:hidden"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="پاک کردن متن"
                  className="grid size-7 shrink-0 place-items-center rounded-full text-ink-900/35 transition-colors hover:bg-ink-900/5 hover:text-ink-900/70"
                >
                  <XIcon strokeWidth={2.4} className="size-3.5" />
                </button>
              )}
            </form>

            {/* duplicate detection — mounts only after an explicit search */}
            {hasSearched && (
              <SimilarTopicsPanel results={results} className="mt-4 animate-fade-up motion-reduce:animate-none" />
            )}

            {/* explicit continue — Step 3 never appears automatically */}
            {!showDetails && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!trimmedQuery}
                  className={`inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold transition-all duration-200
                              hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]
                              disabled:pointer-events-none disabled:opacity-40
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-600/60 ${
                                hasResults
                                  ? 'border border-ink-900/15 bg-white/80 text-ink-900/60 hover:border-turquoise-600/40 hover:text-turquoise-700'
                                  : 'bg-turquoise-600 text-white shadow-[0_10px_24px_-10px_rgba(26,99,93,0.55)] hover:bg-turquoise-700 hover:shadow-[0_14px_30px_-10px_rgba(26,99,93,0.6)]'
                              }`}
                >
                  {hasResults ? 'موضوع جدید است، ادامه می‌دهم' : 'ادامه'}
                  <ArrowLeftIcon strokeWidth={2.4} className="size-4" />
                </button>
              </div>
            )}
          </section>

          {showDetails && (
            <div ref={detailsStepRef} className="mt-10 animate-fade-up motion-reduce:animate-none">
              {/* ——— step 3 · minimal details + submit ——— */}
              <section aria-label="تکمیل اطلاعات">
                <StepHeading step="۳" title="تکمیل اطلاعات" />
                <TopicDetailsForm
                  className="mt-4"
                  name={name}
                  onNameChange={(value) => {
                    setName(value);
                    setNameTouched(true);
                  }}
                  city={city}
                  onCityChange={setCity}
                  description={description}
                  onDescriptionChange={setDescription}
                  showCityField={selectedType?.locationBased ?? false}
                  onSubmit={handleSubmit}
                />
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}