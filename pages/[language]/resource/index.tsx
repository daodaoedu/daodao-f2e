import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/navigation";
import { CustomLink } from '@/shared/ui/custom-link';
import { ChevronRightIcon } from "lucide-react";
import SEOConfig, { JsonLdType } from "@/components/SEOConfig";
import resourceBannerWebp from "@/public/assets/resource/banner.webp";
import {
  CategoriesContainer,
  ResourceContainer,
  ResourceBanner,
  SectionTitle,
  createResourceJsonLd,
} from "@/features/resources";
import JsonLdFactory from "@/shared/lib/jsonLd";
import { HOT_TAGS } from "@/constants/category";
import { Button } from "@/shared/ui/button";
import { resourceAPI, ResourceListResponseSchema } from "@/services/resources";
import { Container } from "@/shared/ui/wrapper";

// export const runtime = "experimental-edge";

export const getServerSideProps = (async () => {
  try {
    const { data } = await resourceAPI.readList({ limit: 4 });

    const jsonLd = JsonLdFactory.createGraph([
      JsonLdFactory.createItemListBuilder()
        .setName("多元學習資源列表")
        .setItems(data.resources.map(createResourceJsonLd)),
    ]);

    return { props: { data, jsonLd } };
  } catch (error) {
    console.error(error);
    return { props: {} };
  }
}) satisfies GetServerSideProps<{
  data?: ResourceListResponseSchema["data"];
  jsonLd?: JsonLdType;
}>;

export default function ResourcePage({
  data,
  jsonLd,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  return (
    <>
      <SEOConfig title="多元學習資源列表｜島島阿學" jsonLd={jsonLd} />
      {/* 找資源 banner */}
      <ResourceBanner
        title="找資源"
        content="藉由他人真實的資源使用經驗，找到真正適合自己的學習資源，透過個人化推薦系統，幫助每位學習者在龐大的學習資源中，快速找到最適合自己的內容！"
        image={resourceBannerWebp}
        hotTags={HOT_TAGS}
        onSearch={(value) => {
          router.push(`/resource/explore?query=${value}`);
        }}
      />

      {/* 熱門資源, 最新資源, 熱門分類 */}
      <Container className="space-y-11 py-12">
        <section>
          <SectionTitle title="熱門資源">
            <Button
              variant="link"
              className="-mx-2 px-2 body-md font-medium text-basic-300"
              size="lg"
              asChild
            >
              <CustomLink href="/resource/explore">
                探索 所有資源
                <ChevronRightIcon className="w-4 h-4" />
              </CustomLink>
            </Button>
          </SectionTitle>
          <ResourceContainer data={data?.resources.slice(2, 4) ?? []} />
        </section>

        <section>
          <SectionTitle title="最新資源">
            <Button
              variant="link"
              className="-mx-2 px-2 body-md font-medium text-basic-300"
              asChild
            >
              <CustomLink href="/resource/explore">
                探索 所有資源
                <ChevronRightIcon className="w-4 h-4" />
              </CustomLink>
            </Button>
          </SectionTitle>
          <ResourceContainer data={data?.resources.slice(0, 2) ?? []} />
        </section>

        <section>
          <SectionTitle title="熱門分類">
            <Button
              variant="link"
              className="-mx-2 px-2 body-md font-medium text-basic-300"
              asChild
            >
              <CustomLink href="/resource/categories">
                探索 所有分類
                <ChevronRightIcon className="w-4 h-4" />
              </CustomLink>
            </Button>
          </SectionTitle>
          <CategoriesContainer maxLength={8} disabledCollapse />
        </section>
      </Container>

      {/* 熱門心得 */}
      {/* <div className="bg-primary-palest py-12">
        <Container>
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
        </Container>
      </div> */}

      {/* 活躍分享者 */}
      {/* <Container className="py-12">
        <Carousel opts={{ align: "start" }}>
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
      </Container> */}
    </>
  );
}
