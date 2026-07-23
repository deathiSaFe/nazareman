import type { ComponentType } from "react";
import { HomeIcon, PlusIcon, SearchIcon, UserIcon } from "./icons";

type NavItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
};

const items: NavItem[] = [
  { label: "خانه", icon: HomeIcon, active: true },
  { label: "جستجو", icon: SearchIcon },
  { label: "افزودن", icon: PlusIcon },
  { label: "پروفایل", icon: UserIcon },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="ناوبری پایین"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-100 bg-white/90 backdrop-blur"
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-1 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {items.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
              active
                ? "bg-emerald-50/70 text-emerald-600"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}