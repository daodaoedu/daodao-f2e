import { HeroSection } from "./components/HeroSection";
import { ValueProposition } from "./components/ValueProposition";
import { FeaturesOverview } from "./components/FeaturesOverview";
import { Testimonial } from "./components/Testimonial";
import { CTASection } from "./components/CTASection";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const handleGetStarted = () => {
    onLogin();
  };

  return (
    <main className="min-h-screen bg-basic-white">
      <HeroSection />
      <ValueProposition />
      <FeaturesOverview onGetStarted={handleGetStarted} />
      <Testimonial />
      <CTASection onGetStarted={handleGetStarted} />
    </main>
  );
}
