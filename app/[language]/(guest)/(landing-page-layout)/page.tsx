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

export default function LandingPage() {
  return (
    <Loader>
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
