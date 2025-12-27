import { getTranslations } from "@daodao/i18n/server";
import { ANCHOR_IDS, SOCIAL_LINKS } from "@daodao/shared";
import { Image } from "@daodao/ui/components/image";
import { SectionHeader } from "@daodao/ui/components/section-header";
import { Text, Title } from "@daodao/ui/components/typography";
import { cn } from "@daodao/ui/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("hero_title"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const missionGoals = [
    {
      title: t("mission_goal_1_title"),
      description: t("mission_goal_1_desc"),
    },
    {
      title: t("mission_goal_2_title"),
      description: t("mission_goal_2_desc"),
    },
    {
      title: t("mission_goal_3_title"),
      description: t("mission_goal_3_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-primary-palest to-background px-6 pb-16 pt-32 md:pt-40">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl text-center">
            <Title as="h1" size="xl" className="mb-6 text-primary-darker">
              {t("hero_title")}
            </Title>
            <Text size="lg" className="mb-6 text-primary-darker">
              {t("hero_subtitle")}
            </Text>
            <Text size="md" className="mb-8 text-basic-400">
              {t("hero_description")}
            </Text>
            <div className="rounded-lg bg-white/60 p-6 backdrop-blur-sm">
              <Text size="md" className="mb-2 font-medium text-primary-darker">
                {t("hero_tagline")}
              </Text>
              <Text size="sm" className="italic text-basic-400">
                {t("hero_tagline_en")}
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id={ANCHOR_IDS.VISION} className="bg-background px-6 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl">
            <SectionHeader
              title={t("vision_title")}
              variant="dark"
              size="lg"
              alignment="center"
              showSubtitle={false}
            />
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-3xl">
                <Image
                  src="/assets/about/about.png"
                  alt={t("vision_image_alt")}
                  width={1200}
                  height={675}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            </div>
            <div className="space-y-6 text-center">
              <Text size="md" className="text-basic-400">
                {t("vision_content")}
              </Text>
              <Text size="md" className="text-basic-400">
                {t("vision_content_2")}
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id={ANCHOR_IDS.MISSION} className="bg-primary-palest px-6 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              title={t("mission_title")}
              variant="dark"
              size="lg"
              alignment="center"
              showSubtitle={false}
            />
            <div className="mb-12 text-center">
              <Text size="md" className="mb-8 text-basic-400">
                {t("mission_intro")}
              </Text>
              <Text size="md" className="font-medium text-primary-darker">
                {t("mission_subtitle")}
              </Text>
            </div>

            {/* Mission Goals Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {missionGoals.map((goal, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border border-primary-lighter bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md",
                    "flex flex-col"
                  )}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-base text-2xl font-bold text-white">
                    {index + 1}
                  </div>
                  <Title as="h3" size="md" className="mb-3 text-primary-darker">
                    {goal.title}
                  </Title>
                  <Text size="sm" className="text-basic-400">
                    {goal.description}
                  </Text>
                </div>
              ))}
            </div>

            {/* Mission Belief */}
            <div className="mt-12 text-center">
              <div className="mx-auto max-w-3xl rounded-lg border-l-4 border-primary-base bg-white/60 p-6 backdrop-blur-sm">
                <Text size="md" className="font-medium italic text-primary-darker">
                  {t("mission_belief")}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-background px-6 py-16 md:py-24">
        <div className="container mx-auto">
          <div className="mx-auto max-w-4xl">
            <SectionHeader
              title={t("contact_title")}
              variant="dark"
              size="lg"
              alignment="center"
              showSubtitle={false}
            />
            <div className="mt-12 flex flex-col items-center gap-6 md:flex-row md:justify-center">
              <a
                href={SOCIAL_LINKS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-primary-lighter bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:border-primary-base hover:shadow-md"
              >
                <Image
                  src="/assets/landing-page/icon-Facebook.svg"
                  alt={t("contact_facebook_alt")}
                  width={24}
                  height={24}
                  className="transition-opacity group-hover:opacity-80"
                />
                <Text size="md" className="text-primary-darker group-hover:text-primary-base">
                  {t("contact_facebook")}
                </Text>
              </a>
              <a
                href={SOCIAL_LINKS.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-primary-lighter bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:border-primary-base hover:shadow-md"
              >
                <Image
                  src="/assets/landing-page/icon-Instagram.svg"
                  alt={t("contact_instagram_alt")}
                  width={24}
                  height={24}
                  className="transition-opacity group-hover:opacity-80"
                />
                <Text size="md" className="text-primary-darker group-hover:text-primary-base">
                  {t("contact_instagram")}
                </Text>
              </a>
              <a
                href={`mailto:${SOCIAL_LINKS.EMAIL}`}
                className="group flex items-center gap-3 rounded-lg border border-primary-lighter bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:border-primary-base hover:shadow-md"
              >
                <Text size="md" className="text-primary-darker group-hover:text-primary-base">
                  {t("contact_email")} – {SOCIAL_LINKS.EMAIL}
                </Text>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
