import { LandingPage } from "@/components/landing-page";
import { LandingPageFloatButtons } from "@/components/layout";

export default async function HomePage() {
  return (
    <>
      <LandingPageFloatButtons />
      <LandingPage />
    </>
  );
}
