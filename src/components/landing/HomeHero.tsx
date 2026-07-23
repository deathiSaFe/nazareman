import { ActionButton } from "./ActionButton";

export function HomeHero() {
  return (
    <section className="flex flex-col items-center text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
        نظرمن
      </h1>

      <p className="mt-3 text-lg leading-8 text-neutral-500">
        نظر مردم، قبل از تصمیم شما
      </p>

      <span
        className="mt-6 h-1.5 w-16 rounded-full bg-emerald-600"
        aria-hidden="true"
      />

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <ActionButton variant="primary">جستجو</ActionButton>
        <ActionButton variant="secondary">ثبت نظر</ActionButton>
      </div>
    </section>
  );
}