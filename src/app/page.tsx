import { HomeHero } from "../components/landing/HomeHero";
import { CategoryGrid } from "../components/landing/CategoryGrid";
import { BottomNavigation } from "../components/landing/BottomNavigation";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <main className="mx-auto w-full max-w-md px-5 pb-32 pt-12 sm:max-w-xl sm:px-6 md:max-w-3xl lg:max-w-5xl">
        <HomeHero />
        <CategoryGrid />
      </main>

      <BottomNavigation />
    </div>
  );
}