import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { SectionHeader } from "@daodao/ui/components/section-header";

interface FeatureCardProps {
  title: string;
  description: string;
  tag: string;
  image: string;
  details: string[];
}

export function FeatureCard({ title, description, tag, image, details }: FeatureCardProps) {
  return (
    <div className="mb-6 p-4">
      <div className="flex h-8 w-[84px] items-center justify-center rounded bg-tips text-sm text-white">
        {tag}
      </div>
      <div className="relative mb-4 h-[200px] w-full overflow-hidden rounded-lg md:h-[200px]">
        <Image src={image} alt={title} fill className="object-contain" />
      </div>
      <h4 className="mb-2 text-center text-[22px] font-semibold text-primary-base">{title}</h4>
      <p className="mb-4 text-center text-sm text-basic-400">{description}</p>
      <ul className="space-y-2">
        {details.map((detail) => (
          <li
            key={detail}
            className="relative flex min-h-[40px] items-center pl-10 pr-2 text-base leading-6"
          >
            <span className="absolute left-0 top-1/2 size-10 -translate-y-1/2 bg-[url(/assets/landing-page/icon-bulb.svg)] bg-center bg-no-repeat" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeatureGrid() {
  const t = useTranslations("landing_page");

  const features = [
    {
      title: t("feature_grid_item_0_title"),
      description: t("feature_grid_item_0_description"),
      tag: t("feature_grid_item_0_tag"),
      image: "/assets/landing-page/feature-tracker.png",
      details: [
        t("feature_grid_item_0_detail_0"),
        t("feature_grid_item_0_detail_1"),
        t("feature_grid_item_0_detail_2"),
      ],
    },
    {
      title: t("feature_grid_item_1_title"),
      description: t("feature_grid_item_1_description"),
      tag: t("feature_grid_item_1_tag"),
      image: "/assets/landing-page/feature-community.png",
      details: [
        t("feature_grid_item_1_detail_0"),
        t("feature_grid_item_1_detail_1"),
        t("feature_grid_item_1_detail_2"),
      ],
    },
    {
      title: t("feature_grid_item_2_title"),
      description: t("feature_grid_item_2_description"),
      tag: t("feature_grid_item_2_tag"),
      image: "/assets/landing-page/feature-chart.png",
      details: [t("feature_grid_item_2_detail_0"), t("feature_grid_item_2_detail_1")],
    },
  ];

  return (
    <div className="w-full pt-16">
      <div className="container mx-auto">
        <div
          className="relative flex flex-col items-center justify-center overflow-x-clip pb-[60px]"
          id="solutions"
        >
          <SectionHeader
            title={t("feature_grid_section_title")}
            subtitle={t("feature_grid_section_subtitle")}
            variant="dark"
            size="lg"
            alignment="center"
          />
          <div className="flex flex-col items-stretch text-primary-darker md:flex-row">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                tag={feature.tag}
                image={feature.image}
                details={feature.details}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
