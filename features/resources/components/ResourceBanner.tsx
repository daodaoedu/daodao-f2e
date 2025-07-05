// import { useRouter } from "next/router";
import Link from "next/link";
import { SearchIcon, SendHorizontalIcon } from "lucide-react";
import Image from "@/shared/components/Image";
import { OptionProps } from "@/components/ui/option";
// import { AuthButton } from "@/contexts/Auth";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/wrapper";
import { Input } from "@/components/ui";
import SectionTitle from "./SectionTitle";

interface ResourceBannerProps {
  size?: "md" | "lg";
  title: string;
  content: string;
  image: string;
  hotTags?: OptionProps[];
  length?: number;
  onSearch?: (value: string) => void;
}

export default function ResourceBanner({
  size = "lg",
  title,
  content,
  image,
  hotTags,
  length,
  onSearch,
}: ResourceBannerProps) {
  // const router = useRouter();
  const isMediumSize = size === "md";
  const isLargeSize = size === "lg";

  return (
    <section
      className={cn(
        "relative bg-primary-palest md:py-12",
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

      <Container>
        {/* 搜尋欄 標籤 分享資源 */}
        <div className="relative pt-5 pb-11 lg:w-3/5 flex flex-col gap-5 md:p-0 md:gap-6">
          <div>
            <SectionTitle as={isMediumSize ? "h2" : "h1"} title={title} />

            <div className="text-basic-500 text-5 mt-2 md:text-[1.125rem] md:mt-3">
              {content}
            </div>
          </div>

          {/* 搜尋欄 */}
          {isLargeSize && (
            <Input
              inputClassName="bg-white"
              prefixIcon={<SearchIcon />}
              suffixIcon={(v) => v.length > 0 && <SendHorizontalIcon />}
              onSuffixIconClick={onSearch}
              placeholder="想找什麼資源..."
            />
          )}

          <div className="flex flex-col">
            {/* 標籤 */}
            {isLargeSize && Array.isArray(hotTags) && hotTags.length > 0 && (
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-5 md:mb-6">
                <div className="text-nowrap min-w-[4.5rem] h-[1.875rem] text-xl font-bold md:text-lg md:leading-[1.6875rem] md:h-[1.6875rem]">
                  熱門標籤
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {hotTags.map(({ label, value }) => {
                    return (
                      <Badge
                        key={value}
                        variant="outline"
                        className="px-3 py-0.5 text-primary-base"
                        asChild
                      >
                        <Link href={`/resource/categories/${value}`}>
                          <span className="font-bold">#</span>
                          {label}
                        </Link>
                      </Badge>
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

            {/* <AuthButton
              className="md:w-max"
              size="lg"
              onClick={() => router.push("/resource/create")}
            >
              + 分享資源
            </AuthButton> */}
          </div>
        </div>
      </Container>
    </section>
  );
}
