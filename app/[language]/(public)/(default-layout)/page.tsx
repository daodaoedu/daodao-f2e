import {
  Loader,
  KeyVision,
  SloganSection,
  FeatureGrid,
  PresentationSection,
  BubbleDialog,
  VideoSection,
  FunctionCarousel,
  PlanSection,
  TestimonialMarquee,
  CTASection,
  PersonalitySection,
} from './_home';
import { FloatButtons } from './_layout';

export default function HomePage() {
  return (
    <Loader>
      <FloatButtons />
      <KeyVision />
      <SloganSection />
      <FeatureGrid />
      <PresentationSection />
      <BubbleDialog />
      <VideoSection />
      <FunctionCarousel />
      <PlanSection />
      <TestimonialMarquee />
      <CTASection />
      <PersonalitySection />
    </Loader>
  );
}
