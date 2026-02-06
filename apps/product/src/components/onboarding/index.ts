// Main form component
export { OnboardingForm } from "./onboarding-form";

// Section components
export { InterestsSection } from "./interests-section";
export { ProfileSection } from "./profile-section";
export { ReferralSection } from "./referral-section";
export { SuccessSection } from "./success-section";

// Stepper component
export { OnboardingStepper } from "./onboarding-stepper";

// Hooks
export { useOnboardingStep } from "./use-onboarding-step";

// Schema and types
export {
  AVAILABLE_FIELDS,
  INTEREST_CATEGORIES,
  interestsStepSchema,
  type OnboardingFormValues,
  onboardingFormSchema,
  profileStepSchema,
  REFERRAL_SOURCE_OPTIONS,
  referralStepSchema,
} from "./schema";
