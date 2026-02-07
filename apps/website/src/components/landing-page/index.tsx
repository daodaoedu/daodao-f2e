"use client";

import { FootprintSection } from "./footprint-section";
import { JoinSection } from "./join-section";
import { KeyVision } from "./key-vision";
import { LearningFoundationSection } from "./learning-foundation-section";
import { Loader } from "./loader";
import { PersonalitySection } from "./personality-section";
import { PersonaSection } from "./persona-section";
import { QuickStartSection } from "./quick-start-section";
import { TransitionBanner } from "./transition-banner";

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
      {/* 6. Join — merged Community + Feature Grid + Plan */}
      <JoinSection />
      {/* 7. Transition Banner — replaces Typewriter + Presentation */}
      <TransitionBanner />
      {/* 8. Learning DNA / Quiz — updated layout */}
      <PersonalitySection />
    </Loader>
  );
}
