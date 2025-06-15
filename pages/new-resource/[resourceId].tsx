import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { z } from "zod";
import useQueryState from "@/hooks/useQueryState";
import { CommentType } from "@/services/comments";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import NotExist from "@/shared/components/NotExist";
import CommentSection from "@/shared/components/Comment/CommentSection";
import { parseToNumber } from "@/utils/helper";
import {
  ResourceDetail,
  ResourceIntroduction,
  ResourceReviewList,
  ContributorInfo,
} from "@/features/resources/components";

enum TabEnum {
  Introduction = "introduction",
  Reviews = "reviews",
  Contributor = "contributor",
}

export const getServerSideProps = (async (context) => {
  const resourceId = parseToNumber(context.params?.resourceId);

  try {
    if (typeof resourceId !== "number") {
      return {
        notFound: true,
      };
    }

    const resource = await resourceAPI.read(resourceId);

    return {
      props: {
        resource,
      },
    };
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    return {
      notFound: true,
    };
  }
}) satisfies GetServerSideProps<{
  resource?: ResourceDetailResponseSchema;
  notFound?: boolean;
}>;

export default function ResourceDetailPage({
  resource,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [query, setQuery] = useQueryState(z.object({ tab: z.nativeEnum(TabEnum) }));

  if (!resource) {
    return <NotExist />;
  }

  return (
    <div className="bg-primary-palest min-h-screen">
      <div className="container mx-auto px-4 pb-12 pt-11 md:pt-12">
        <Breadcrumb className="mb-5 md:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/find-resource">找資源</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/find-resource?category=${resource.majorCategory}`}
              >
                {resource.majorCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/find-resource?category=${resource.subCategory}`}
              >
                {resource.subCategory}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resource.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ResourceDetail resource={resource} />

        <div className="bg-white shadow rounded-xl">
          <Tabs
            defaultValue={query.tab ?? TabEnum.Introduction}
            onValueChange={(value) => setQuery({ tab: value as TabEnum })}
          >
            <TabsList>
              <TabsTrigger value={TabEnum.Introduction} className="basis-1/3">
                介紹
              </TabsTrigger>
              <TabsTrigger value={TabEnum.Reviews} className="basis-1/3">
                心得 ({resource.reviewCount || 0})
              </TabsTrigger>
              <TabsTrigger value={TabEnum.Contributor} className="basis-1/3">
                分享者資訊
              </TabsTrigger>
            </TabsList>

            <Separator />

            <TabsContent value={TabEnum.Introduction}>
              <ResourceIntroduction resource={resource} />
            </TabsContent>

            <TabsContent value={TabEnum.Reviews}>
              <ResourceReviewList resource={resource} />
            </TabsContent>

            <TabsContent value={TabEnum.Contributor}>
              <ContributorInfo resource={resource} />
            </TabsContent>
          </Tabs>
        </div>
        <h3 className="heading-lg mt-12">留言</h3>
        <div className="-mx-4">
          <CommentSection
            targetId={resource.id}
            targetType={CommentType.Resource}
          />
        </div>
      </div>
    </div>
  );
}
