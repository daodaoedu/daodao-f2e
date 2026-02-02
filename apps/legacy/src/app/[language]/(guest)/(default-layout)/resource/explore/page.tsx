import type { Metadata } from "next";
import { unstable_serialize } from "swr";
import type { JsonLdType } from "@/components/SEOConfig";
import { getResourceListData, type ResourceListResponse } from "@/entities/resource";
import { createResourceJsonLd } from "@/features/resources/utils";
import type { ResourceListResponseSchema } from "@/services/resources";
import { getResourcePathname } from "@/services/resources/core/api";
import JsonLdFactory from "@/shared/lib/jsonLd";
import { ResourceExplorePageWidget } from "@/src/widgets/resources";

export const metadata: Metadata = {
  title: "探索所有資源｜島島阿學",
};

export default async function ResourceExplorePage() {
  let fallback: Record<string, ResourceListResponseSchema[]> | undefined;
  let jsonLd: JsonLdType | undefined;

  try {
    const searchParams = { limit: 4 };
    const [, response] = await getResourceListData(searchParams);
    const responseData = response?.data as { data?: ResourceListResponse } | undefined;

    if (
      responseData?.data &&
      "resources" in responseData.data &&
      "pagination" in responseData.data
    ) {
      jsonLd = JsonLdFactory.createGraph([
        JsonLdFactory.createItemListBuilder()
          .setName("探索所有資源")
          .setItems(responseData.data.resources.map(createResourceJsonLd)),
      ]);

      // useSWRInfinite 期望的 fallback 格式是数组，key 需要匹配 [pathname, query] 格式
      const swrKey: [string, typeof searchParams] = [getResourcePathname(), searchParams];
      fallback = {
        [unstable_serialize(swrKey)]: [{ data: responseData.data }],
      };
    }
  } catch {
    // Error handling: fallback will be undefined if API call fails
  }

  return <ResourceExplorePageWidget fallback={fallback} jsonLd={jsonLd} />;
}
