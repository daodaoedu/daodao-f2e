import { FloatButtons } from '@/widgets/menu';
import {
  Loader,
  KeyVision,
  SloganSection,
  FeatureGrid,
  PresentationSection,
  TypewriterBubble,
  VideoSection,
  FunctionCarousel,
  PlanSection,
  TestimonialMarquee,
  CallToActionSection,
  PersonalitySection,
} from '@/widgets/landing-page';

export default function HomePage() {
  return (
    <Loader>
      <FloatButtons />
      <KeyVision />
      <SloganSection />
      <FeatureGrid />
      <PresentationSection />
      <TypewriterBubble />
      <VideoSection />
      <FunctionCarousel />
      <PlanSection />
      <TestimonialMarquee />
      <CallToActionSection />
      <PersonalitySection />
    </Loader>
  );
}
