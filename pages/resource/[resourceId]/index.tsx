import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { z } from "zod";
import useQueryState from "@/hooks/useQueryState";
import SEOConfig from "@/shared/components/SEO";
// import { CommentType } from "@/services/comments";
import { resourceAPI } from "@/services/resources/core/api";
import { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import NotExist from "@/shared/components/NotExist";
// import CommentSection from "@/shared/components/Comment/CommentSection";
import { Container } from "@/components/ui/wrapper";
import { parseToString } from "@/utils/helper";
import {
  ResourceDetail,
  ResourceIntroduction,
  ResourceReviewList,
  ContributorInfo,
} from "@/features/resources/components";
import { parseCategoryHierarchy } from "@/features/resources";

enum TabEnum {
  Introduction = "introduction",
  Reviews = "reviews",
  Contributor = "contributor",
}

export const runtime = "experimental-edge";

export const getServerSideProps = (async (context) => {
  try {
    const resourceId = parseToString(context.params?.resourceId);

    if (!resourceId) {
      return { notFound: true };
    }

    const { data } = await resourceAPI.read(resourceId);

    return {
      props: { data },
    };
  } catch {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{
  data: ResourceDetailResponseSchema["data"];
}>;

export default function ResourceDetailPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [query, setQuery] = useQueryState(
    z.object({
      tab: z.nativeEnum(TabEnum).optional().default(TabEnum.Introduction),
    })
  );

  if (!data) {
    return <NotExist />;
  }

  const [majorCategory, subCategory] = parseCategoryHierarchy([
    data.majorCategory,
    data.subCategory ?? "",
  ]);

  const baseCategoriesUrl = "/resource/categories";

  return (
    <div className="bg-primary-palest min-h-screen">
      <SEOConfig
        title={`${data.name} - 分享資源 | 島島阿學`}
        description={data.description}
      />
      <Container className="pb-12 pt-11 md:pt-12">
        <Breadcrumb className="mb-5 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${baseCategoriesUrl}/${majorCategory?.value}`}
              >
                {majorCategory?.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`${baseCategoriesUrl}/${majorCategory?.value}/${subCategory?.value}`}
              >
                {subCategory?.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ResourceDetail resource={data} />

        <div className="bg-white shadow rounded-xl">
          <Tabs
            defaultValue={query.tab ?? TabEnum.Introduction}
            onValueChange={(value) => setQuery({ tab: value as TabEnum })}
          >
            <TabsList>
              <TabsTrigger value={TabEnum.Introduction} className="basis-1/3">
                介紹
              </TabsTrigger>
              <TabsTrigger
                value={TabEnum.Reviews}
                className="basis-1/3"
                onClick={() => toast.error("尚未開放心得分享功能")}
                disabled
              >
                心得 ({data.reviewCount || 0})
              </TabsTrigger>
              <TabsTrigger
                value={TabEnum.Contributor}
                className="basis-1/3"
                disabled={!data.user?._id}
              >
                分享者資訊
              </TabsTrigger>
            </TabsList>

            <Separator />

            <TabsContent value={TabEnum.Introduction}>
              <ResourceIntroduction resource={data} />
            </TabsContent>

            <TabsContent value={TabEnum.Reviews}>
              <ResourceReviewList
                resource={data}
                onCreateReview={() => {
                  router.push(`/resource/${data.id}/reviews/create`);
                }}
              />
            </TabsContent>

            <TabsContent value={TabEnum.Contributor}>
              <ContributorInfo user={data.user} />
            </TabsContent>
          </Tabs>
        </div>
        {/* <h3 className="heading-lg mt-12">留言</h3>
        <div className="-mx-4">
          <CommentSection
            targetId={data.id}
            targetType={CommentType.Resource}
          />
        </div> */}
      </Container>
    </div>
  );
}
