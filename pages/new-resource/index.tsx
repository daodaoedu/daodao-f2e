import type { InferGetStaticPropsType, GetStaticProps } from "next";
import Link from "next/link";
import SEOConfig, { JsonLdType } from "@/shared/components/SEO";
import { ChevronRightIcon } from "lucide-react";
import {
  CategoriesContainer,
  ReflectionCard,
  ResourceContainer,
  ResourceBanner,
  SectionTitle,
  SharerCard,
  createResourceJsonLd,
} from "@/features/resources";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/atoms/carousel";
import JsonLdFactory from "@/utils/jsonLd";
import { cn } from "@/utils/cn";
import { SEARCH_TAGS } from "@/constants/category";
import { Button } from "@/components/atoms/button";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";

const Section = ({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <section
      className={cn(
        "flex flex-col gap-11 px-5 py-11 md:px-24 md:py-12",
        className
      )}
    >
      {children}
    </section>
  );
};

export const getStaticProps = (async () => {
  try {
    const data = await resourceAPI.readList();

    const coursesJsonLd = data.resources.slice(0, 4).map(createResourceJsonLd);

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName("多元學習資源列表")
        .setItems(coursesJsonLd),
    ]);

    return { props: { data, jsonLd } };
  } catch {
    return { props: { data: undefined, jsonLd: undefined } };
  }
}) satisfies GetStaticProps<{
  data: ResourceListResponseSchema | undefined;
  jsonLd: JsonLdType | undefined;
}>;

export default function ResourcePage({
  data,
  jsonLd,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const reflectionList = [1, 2, 3, 4, 5, 6, 7];
  const sharerList = [1, 2, 3, 4, 5, 6];

  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      {/* 找資源 banner */}
      <ResourceBanner
        title="找資源"
        content="藉由他人真實的資源使用經驗，找到真正適合自己的學習資源，透過個人化推薦系統，幫助每位學習者在龐大的學習資源中，快速找到最適合自己的內容！"
        image=""
        hotTags={SEARCH_TAGS.all.map(({ label }) => label)}
      />

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <Section>
        <div>
          <SectionTitle title="熱門資源">
            <Button
              variant="link"
              className="-mx-2 px-2 heading-md font-medium text-basic-300"
              size="lg"
              asChild
            >
              <Link href="/new-resource/explore">
                探索 所有資源
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </Button>
          </SectionTitle>
          <ResourceContainer data={data?.resources.slice(2, 4) ?? []} />
        </div>

        <div>
          <SectionTitle title="最新資源">
            <Button
              variant="link"
              className="-mx-2 px-2 body-lg font-medium text-basic-300"
              asChild
            >
              <Link href="/new-resource/explore">
                探索 所有資源
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </Button>
          </SectionTitle>
          <ResourceContainer data={data?.resources.slice(0, 2) ?? []} />
        </div>

        <div>
          <SectionTitle title="熱門分類">
            <Button
              variant="link"
              className="-mx-2 px-2 body-lg font-medium text-basic-300"
              asChild
            >
              <Link href="/new-resource/categories">
                探索 所有分類
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </Button>
          </SectionTitle>
          <CategoriesContainer maxLength={8} disabledCollapse />
        </div>
      </Section>

      {/* 熱門心得 */}
      <Section className="bg-primary-palest">
        <Carousel opts={{ loop: true, align: "start" }}>
          <div className="flex justify-between items-center mb-9">
            <h2 className="text-2xl font-medium text-basic-500">熱門心得</h2>
            <div className="flex gap-2">
              <CarouselPrevious className="static translate-y-0 mx-1" />
              <CarouselNext className="static translate-y-0 mx-1" />
            </div>
          </div>
          <CarouselContent>
            {reflectionList.map((item) => (
              <CarouselItem
                key={item}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ReflectionCard />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Section>

      {/* 活躍分享者 */}
      <Section>
        <Carousel opts={{ loop: true, align: "start" }}>
          <div className="flex justify-between items-center mb-9">
            <h2 className="text-2xl font-medium text-basic-500">活躍分享者</h2>
            <div className="flex gap-2">
              <CarouselPrevious className="static translate-y-0 mx-1" />
              <CarouselNext className="static translate-y-0 mx-1" />
            </div>
          </div>
          <CarouselContent>
            {sharerList.map((item, index) => (
              <CarouselItem
                key={item}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <SharerCard order={index + 1} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </Section>
    </>
  );
}
