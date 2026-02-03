"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@daodao/ui/components/tabs";
import { Separator } from "@daodao/ui/components/separator";
import type { ResourceData } from "@daodao/api";
import { ResourceIntroduction } from "./introduction";
import { ContributorInfo } from "./contributor-info";

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
        <TabsTrigger
          value={TabEnum.Reviews}
          className="basis-1/3"
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
        <div className="text-center text-gray-500 py-10">
          心得分享功能尚未開放
        </div>
      </TabsContent>

      <TabsContent value={TabEnum.Contributor}>
        {resource.user && <ContributorInfo user={resource.user} />}
      </TabsContent>
    </Tabs>
  );
}
