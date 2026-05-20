import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { SectionHeader } from "@daodao/ui/components/section-header";

export function PresentationSection() {
  const t = useTranslations("landing_page");
  return (
    <section className="relative bg-basic-600 pt-16 md:py-24">
      {/* 裝飾元素 - 黃色花朵 */}
      <Image
        className="absolute left-[12%] top-0 animate-spin-slow"
        src="/assets/landing-page/deco-flower-yellow.svg"
        alt={t("presentation_deco_flower_alt")}
        width={100}
        height={90}
      />

      <div className="container mx-auto flex flex-col items-center justify-end text-center">
        <SectionHeader
          title={t("presentation_title")}
          subtitle={t("presentation_subtitle")}
          variant="light"
          alignment="center"
          titleClassName=""
          subtitleClassName="text-mascot-aqua"
        />
      </div>

      {/* 學習進度展示圖片 - 突破 container padding */}
      <div className="flex w-full justify-end md:container md:mx-auto md:justify-center">
        <div className="relative block aspect-78/77 w-full md:aspect-641/484 md:max-w-[600px]">
          <Image
            src="/assets/landing-page/learning-progress-desktop.png"
            className="hidden md:block"
            alt={t("presentation_progress_image_alt")}
            fill
          />
          <Image
            src="/assets/landing-page/learning-progress-mobile.png"
            className="block md:hidden"
            alt={t("presentation_progress_image_alt")}
            fill
          />
        </div>
      </div>

      {/* 裝飾元素 - 吉祥物 */}
      <Image
        className="absolute bottom-0 right-[10%]"
        src="/assets/landing-page/deco-mascot-2.svg"
        alt={t("presentation_mascot_alt")}
        width={143}
        height={132}
      />
    </section>
  );
}
