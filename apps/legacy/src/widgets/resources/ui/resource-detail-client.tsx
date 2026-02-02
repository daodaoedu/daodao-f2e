"use client";

import { toast } from "sonner";
import { z } from "zod";
import { LazyCommentSection } from "@/features/comment";
import {
  ContributorInfo,
  ResourceIntroduction,
  ResourceReviewList,
} from "@/features/resources/components";
import { CommentType } from "@/services/comments";
import type { ResourceDetailResponseSchema } from "@/services/resources/core/schema";
import { useRouter } from "@/shared/i18n/navigation";
import useQueryState from "@/shared/lib/use-query-state";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

enum TabEnum {
  Introduction = "introduction",
  Reviews = "reviews",
  Contributor = "contributor",
}

interface ResourceDetailClientProps {
  resource: ResourceDetailResponseSchema["data"];
  defaultTab?: TabEnum;
}

export function ResourceDetailClient({
  resource,
  defaultTab = TabEnum.Introduction,
}: ResourceDetailClientProps) {
  const router = useRouter();
  const [query, setQuery] = useQueryState(
    z.object({
      tab: z.nativeEnum(TabEnum).optional().default(defaultTab),
    })
  );

  return (
    <Tabs
      defaultValue={query.tab ?? defaultTab}
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
          心得 ({resource.reviewCount || 0})
        </TabsTrigger>
        <TabsTrigger
          value={TabEnum.Contributor}
          className="basis-1/3"
          disabled={!resource.user?.id}
        >
          分享者資訊
        </TabsTrigger>
      </TabsList>

      <Separator />

      <TabsContent value={TabEnum.Introduction}>
        <ResourceIntroduction resource={resource} />
      </TabsContent>

      <TabsContent value={TabEnum.Reviews}>
        <ResourceReviewList
          resource={resource}
          commentSection={
            <LazyCommentSection targetId={resource.id} targetType={CommentType.ResourceReview} />
          }
          onCreateReview={() => {
            router.push(`/resource/${resource.id}/reviews/create`);
          }}
        />
      </TabsContent>

      <TabsContent value={TabEnum.Contributor}>
        <ContributorInfo user={resource.user} />
      </TabsContent>
    </Tabs>
  );
}
