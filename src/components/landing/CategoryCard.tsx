import type { ReactNode } from "react";

type CategoryCardProps = {
  label: string;
  icon: ReactNode;
};

export function CategoryCard({ label, icon }: CategoryCardProps) {
  return (
    <button
      type="button"
      className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-3xl border border-neutral-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 active:scale-[0.98]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
        {icon}
      </span>

      <span className="text-sm font-semibold text-neutral-800">{label}</span>
    </button>
  );
}