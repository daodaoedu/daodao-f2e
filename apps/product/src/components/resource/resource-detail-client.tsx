"use client";

import { posthogCapture } from "@daodao/analytics";
import type { ResourceData } from "@daodao/api";
import { useRecordView } from "@daodao/api";
import { usePathname, useRouter, useSearchParams } from "@daodao/i18n/navigation";
import { Separator } from "@daodao/ui/components/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { useEffect } from "react";
import { ContributorInfo } from "./contributor-info";
import { ResourceIntroduction } from "./introduction";

enum TabEnum {
  Introduction = "introduction",
  Reviews = "reviews",
  Contributor = "contributor",
}

interface ResourceDetailClientProps {
  resource: ResourceData;
  defaultTab?: TabEnum;
}

export function ResourceDetailClient({
  resource,
  defaultTab = TabEnum.Introduction,
}: ResourceDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const recordView = useRecordView();

  useEffect(() => {
    if (resource.id) {
      recordView("resource", resource.id);
      posthogCapture("content_viewed", {
        entity_type: "resource",
        entity_id: resource.id,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
        platform: "web",
      });
    }
    // recordView 是 useCallback 空 deps，referrer 取自 mount 時的 document，故意只跑一次
  }, [recordView, resource.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentTab = (searchParams.get("tab") as TabEnum) ?? defaultTab;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value={TabEnum.Introduction} className="basis-1/3">
          介紹
        </TabsTrigger>
        <TabsTrigger value={TabEnum.Reviews} className="basis-1/3" disabled>
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
        <div className="text-center text-gray-500 py-10">心得分享功能尚未開放</div>
      </TabsContent>

      <TabsContent value={TabEnum.Contributor}>
        {resource.user && <ContributorInfo user={resource.user} />}
      </TabsContent>
    </Tabs>
  );
}
