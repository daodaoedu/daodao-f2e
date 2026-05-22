import { setRequestLocale } from "@daodao/i18n/server";
import { LandingPage } from "@/components/landing-page";
import { LandingPageFloatButtons } from "@/components/layout";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <LandingPageFloatButtons />
      <LandingPage />
    </>
  );
}
