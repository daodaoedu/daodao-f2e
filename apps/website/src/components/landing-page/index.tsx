"use client";

import { useIsMobile } from "@daodao/shared";
import { CallToActionSection } from "./call-to-action-section";
import { FeatureGrid } from "./feature-grid";
import { FunctionCarousel } from "./function-carousel";
import { KeyVision } from "./key-vision";
import { Loader } from "./loader";
import { PersonalitySection } from "./personality-section";
import { PlanSection } from "./plan-section";
import { PresentationSection } from "./presentation-section";
import { SloganSection } from "./slogan-section";
import { TestimonialMarquee } from "./testimonial-marquee";
import { TypewriterBubble } from "./typewriter-bubble";
import { VideoSection } from "./video-section";

export function LandingPage() {
  const isMobile = useIsMobile();
  console.log(isMobile);
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
