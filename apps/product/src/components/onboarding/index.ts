// Main form component

// Section components
export { InterestsSection } from "./interests-section";
export { OnboardingForm } from "./onboarding-form";
// Stepper component
export { OnboardingStepper } from "./onboarding-stepper";
export { ProfileSection } from "./profile-section";
export { ReferralSection } from "./referral-section";
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
export { SuccessSection } from "./success-section";
// Hooks
export { useOnboardingStep } from "./use-onboarding-step";
