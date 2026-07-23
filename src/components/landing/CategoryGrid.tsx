import { CategoryCard } from "./CategoryCard";
import {
  AcademicCapIcon,
  GlobeIcon,
  InstagramIcon,
  RestaurantIcon,
  ScissorsIcon,
  WrenchIcon,
} from "./icons";

const categories = [
  { label: "رستوران", icon: RestaurantIcon },
  { label: "آرایشگاه", icon: ScissorsIcon },
  { label: "مکانیک", icon: WrenchIcon },
  { label: "استاد", icon: AcademicCapIcon },
  { label: "وب‌سایت", icon: GlobeIcon },
  { label: "اینستاگرام", icon: InstagramIcon },
];

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-heading" className="mt-12">
      <h2 id="categories-heading" className="text-lg font-bold text-neutral-900">
        دسته‌بندی‌ها
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ label, icon: Icon }) => (
          <CategoryCard
            key={label}
            label={label}
            icon={<Icon className="h-6 w-6" />}
          />
        ))}
      </div>
    </section>
  );
}