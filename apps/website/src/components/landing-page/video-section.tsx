import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { SectionHeader } from "@daodao/ui/components/section-header";
import { cn } from "@daodao/ui/lib/utils";

interface VideoItemProps {
  title: string;
  subtitle: string;
  tags: string[];
  captionLabel: string;
}

function VideoItem({ title, subtitle, tags, captionLabel }: VideoItemProps) {
  return (
    <div className="mb-6 w-full py-6 md:w-1/2">
      <video controls className="aspect-video w-full rounded-[20px]">
        <source />
        <track kind="captions" srcLang="zh-TW" label={captionLabel} />
      </video>

      <div className="mb-5 mt-2 rounded-[20px] bg-mascot-aqua px-4 py-2 text-center text-primary-darker">
        <p className="text-xl font-semibold">
          {title}
          <span className="pl-2 text-sm">{subtitle}</span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center">
        {tags.map((tag) => (
          <p
            key={tag}
            className={cn(
              "relative m-1 rounded-[20px] bg-basic-white px-3 py-1.5 pl-[30px] text-sm text-primary-darker",
              "before:absolute before:left-2 before:top-1/2 before:size-4 before:-translate-y-1/2 before:content-[url('/assets/landing-page/icon-check.svg')]"
            )}
          >
            {tag}
          </p>
        ))}
      </div>
    </div>
  );
}

interface VideoSectionProps {
  className?: string;
}

export function VideoSection({ className }: VideoSectionProps) {
  const t = useTranslations("landing_page");

  const videos = [
    {
      title: t("video_item_0_title"),
      subtitle: t("video_item_0_subtitle"),
      tags: [t("video_item_0_tag_0"), t("video_item_0_tag_1"), t("video_item_0_tag_2")],
    },
    {
      title: t("video_item_1_title"),
      subtitle: t("video_item_1_subtitle"),
      tags: [t("video_item_1_tag_0"), t("video_item_1_tag_1"), t("video_item_1_tag_2")],
    },
  ];

  return (
    <section
      className={cn(
        "relative flex flex-col items-center justify-center pb-16",
        "bg-primary-base",
        className
      )}
    >
      {/* 頂部曲線裝飾 */}
      <div
        className="z-10 -mt-24 w-full bg-cover bg-center bg-no-repeat md:bg-top lg:-mt-32"
        style={{
          backgroundImage: 'url("/assets/landing-page/bg-curve-green.svg")',
          height: "150px",
        }}
      />

      <div className="py-15 -mb-16 px-6">
        <SectionHeader
          title={t("video_section_title")}
          subtitle={t("video_section_subtitle")}
          variant="light"
          size="lg"
          alignment="center"
          className="text-white"
        />
      </div>

      <div className="container mx-auto">
        <div className="flex w-full flex-col gap-6 md:flex-row">
          {videos.map((video) => (
            <VideoItem
              key={video.title}
              title={video.title}
              subtitle={video.subtitle}
              tags={video.tags}
              captionLabel={t("video_caption_label")}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full justify-center">
        <Button variant="ctaOrange" size="huge">
          {t("video_cta_button")}
        </Button>
      </div>
    </section>
  );
}
