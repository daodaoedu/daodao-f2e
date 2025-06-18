import { useRef } from "react";
import Image from "@/shared/components/Image";
import LensIcon from "@/public/assets/icons/lens.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import SectionTitle from "./SectionTitle";

interface ResourceBannerProps {
  size?: "md" | "lg";
  title: string;
  content: string;
  image: string;
  hotTags?: string[];
  length?: number;
}

export default function ResourceBanner({
  size = "lg",
  title,
  content,
  image,
  hotTags,
  length,
}: ResourceBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMediumSize = size === "md";
  const isLargeSize = size === "lg";

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <section
      className={cn(
        "relative bg-primary-palest md:py-12 md:px-24 md:flex",
        isMediumSize && "rounded-xl overflow-hidden md:px-10"
      )}
    >
      {/* 圖片 */}
      <div className="relative aspect-video md:aspect-auto md:absolute md:top-0 md:right-0 md:h-full md:object-cover">
        <Image
          src={image}
          alt={title}
          borderRadius="0"
          height="100%"
          className="object-cover"
          wrapperClassName="!block"
        />

        <div className="absolute inset-0 w-full h-full bg-primary-base opacity-30 block md:hidden" />
        <div className="h-full w-[calc(100%+1px)] absolute top-0 right-0 bg-gradient-primary-palest hidden md:block" />
      </div>

      {/* 搜尋欄 標籤 分享資源 */}
      <div className="relative p-5 pb-11 lg:w-3/5 flex flex-col gap-5 md:p-0 md:gap-6">
        <div>
          <SectionTitle as={isMediumSize ? "h2" : "h1"} title={title} />

          <div className="text-basic-500 text-5 mt-2 md:text-[1.125rem] md:mt-3">
            {content}
          </div>
        </div>

        {/* 搜尋欄 */}
        {isLargeSize && (
          <div className="relative">
            <LensIcon
              className="absolute top-[0.625rem] left-4"
              onClick={onClickFocus}
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="想找什麼資源..."
              className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
            />
          </div>
        )}

        <div className="flex flex-col">
          {/* 標籤 */}
          {isLargeSize && Array.isArray(hotTags) && hotTags.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-5 md:mb-6">
              <div className="text-nowrap min-w-[4.5rem] h-[1.875rem] text-xl font-bold md:text-lg md:leading-[1.6875rem] md:h-[1.6875rem]">
                熱門標籤
              </div>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {hotTags.map((tag) => {
                  return (
                    <button
                      key={tag}
                      type="button"
                      className="px-3 py-0.5 text-primary-base bg-white border border-solid border-primary-base rounded-full"
                    >
                      <span className="font-bold">#</span>
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isMediumSize && typeof length === "number" && (
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <div className="body-lg">
                共 <span className="font-bold">{length}</span> 筆資源
              </div>
            </div>
          )}

          <Button className="md:w-max">+ 分享資源</Button>
        </div>
      </div>
    </section>
  );
}
