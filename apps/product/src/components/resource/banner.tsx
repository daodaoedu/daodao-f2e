"use client";

import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import type { StaticImageData } from "next/image";
import { getResourceCategoryLabelKey } from "@/constants/resource";
import { SectionTitle } from "./section-title";

interface HotTag {
  value: string;
  label: string;
}

interface ResourceBannerProps {
  size?: "md" | "lg";
  title: string;
  content: string;
  image: string | StaticImageData;
  hotTags?: HotTag[];
  length?: number;
}

export function ResourceBanner({
  size = "lg",
  title,
  content,
  image,
  hotTags,
  length,
}: ResourceBannerProps) {
  const t = useTranslations("resource");
  const productT = useTranslations("app_product");
  const isMediumSize = size === "md";
  const isLargeSize = size === "lg";

  return (
    <section
      className={cn(
        "relative bg-primary-palest lg:py-12",
        isMediumSize && "rounded-xl overflow-hidden lg:px-10"
      )}
    >
      {/* 圖片 */}
      <div
        className={cn(
          "relative aspect-video overflow-hidden",
          "lg:aspect-auto lg:w-1/2 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:object-cover"
        )}
      >
        <Image src={image} alt={title} className="min-h-full object-cover" />

        <div className="absolute inset-0 block size-full bg-primary-base opacity-30 lg:hidden" />
        <div className="bg-gradient-primary-palest absolute right-0 top-0 hidden size-full lg:block" />
      </div>

      <div className="container">
        {/* 搜尋欄 標籤 分享資源 */}
        <div className="relative flex flex-col gap-5 pb-11 pt-5 lg:w-3/5 lg:gap-6 lg:p-0">
          <div>
            <SectionTitle as={isMediumSize ? "h2" : "h1"} title={title} />

            <div className="text-5 mt-2 text-basic-500 md:mt-3 md:text-[1.125rem]">{content}</div>
          </div>

          {/* TODO Phase 2: 搜尋欄 */}

          <div className="flex flex-col">
            {/* 標籤 */}
            {isLargeSize && Array.isArray(hotTags) && hotTags.length > 0 && (
              <div className="mb-5 flex flex-col gap-2 md:mb-6 md:flex-row md:items-center md:gap-3">
                <div className="h-[1.875rem] min-w-[4.5rem] text-nowrap text-xl font-bold md:h-[1.6875rem] md:text-lg md:leading-[1.6875rem]">
                  {t("hot_tags")}
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {hotTags.map(({ value }) => {
                    const categoryValue = value.split("/").at(-1) ?? value;
                    return (
                      <Badge
                        key={value}
                        variant="outline-logo"
                        className="px-3 py-0.5 text-primary-base"
                        asChild
                      >
                        <CustomLink href={`/resource/categories/${value}`}>
                          <span className="font-bold">#</span>
                          {productT(getResourceCategoryLabelKey(categoryValue))}
                        </CustomLink>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {isMediumSize && typeof length === "number" && (
              <div className="mb-6 flex flex-col md:flex-row md:items-center">
                <div className="body-lg">
                  {t.rich("resource_count", {
                    count: length,
                    bold: (chunks) => <span className="font-bold">{chunks}</span>,
                  })}
                </div>
              </div>
            )}

            {/* TODO Phase 2: 分享資源按鈕 */}
          </div>
        </div>
      </div>
    </section>
  );
}
