"use client";

import { CommunitySection } from "./community-section";
import { FootprintSection } from "./footprint-section";
import { FunctionCarousel } from "./function-carousel";
import { JoinSection } from "./join-section";
import { KeyVision } from "./key-vision";
import { LearningFoundationSection } from "./learning-foundation-section";
import { Loader } from "./loader";
import { PersonaSection } from "./persona-section";
import { PersonalitySection } from "./personality-section";
import { QuickStartSection } from "./quick-start-section";
import { TestimonialMarquee } from "./testimonial-marquee";

export function LandingPage() {
  return (
    <Loader>
      {/* 1. Hero — unchanged */}
      <KeyVision />
      {/* 2. User Personas + Slogan — refactored with carousel */}
      <PersonaSection />
      {/* 3. Learning Foundation — new card stack */}
      <LearningFoundationSection />
      {/* 4. Quick Start — replaces Video Section */}
      <QuickStartSection />
      {/* 5. Footprint — new check-in + journal animation */}
      <FootprintSection />
      {/* 6. Community — join community discussion */}
      <CommunitySection />
      {/* 7. Testimonial Marquee — user testimonials with scrolling animation */}
      <TestimonialMarquee />
      {/* 7. Join — merged Community + Feature Grid + Plan */}
      <JoinSection />
      {/* 6. Function Carousel — feature cards with ribbon banner */}
      <FunctionCarousel />
      {/* 10. Learning DNA / Quiz — updated layout */}
      <PersonalitySection />
    </Loader>
  );
}
