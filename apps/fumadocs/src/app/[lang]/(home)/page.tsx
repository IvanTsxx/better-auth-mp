import { FeatureGrid } from "./_components/feature-grid";
import { HeroSection } from "./_components/hero-section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-blue-500/30">
      <main className="flex-1 grid grid-cols-12 gap-10 px-10 ">
        <HeroSection />
        <FeatureGrid />
      </main>
    </div>
  );
}
