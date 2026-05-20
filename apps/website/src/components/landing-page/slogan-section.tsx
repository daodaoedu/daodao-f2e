import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { SectionHeader } from "@daodao/ui/components/section-header";

export function SloganSection() {
  const t = useTranslations("landing_page");
  return (
    <section className="slogan-section relative min-h-[195px] bg-primary-palest px-6 text-basic-400 md:min-h-[200px]">
      {/* 背景島嶼裝飾圖片 */}
      <div className="absolute left-1/2 top-16 z-10 -translate-x-1/2 md:-top-4">
        <Image
          src="/assets/landing-page/deco-island.svg"
          alt={t("slogan_island_deco_alt")}
          width={429}
          height={208}
          data-preload
        />
      </div>

      {/* 文字內容 */}
      <div className="absolute left-1/2 top-32 z-10 w-full -translate-x-1/2 -translate-y-1/2">
        <SectionHeader
          title={
            <>
              {t("slogan_title_line1")}
              <br />
              {t("slogan_title_line2")}
            </>
          }
          subtitle="Where personal growth meets collective wisdom!"
          variant="dark"
          alignment="center"
          titleClassName="text-primary-darker text-[22px]"
          subtitleClassName="text-basic-400 italic"
        />
      </div>
    </section>
  );
}
