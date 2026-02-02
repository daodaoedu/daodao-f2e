import type { Metadata } from "next";
import type { JsonLdType } from "@/components/SEOConfig";
import { getResourceListData, type ResourceListResponse } from "@/entities/resource";
import { createResourceJsonLd } from "@/features/resources/utils";
import JsonLdFactory from "@/shared/lib/jsonLd";
import { ResourceListPageWidget } from "@/src/widgets/resources";

export const metadata: Metadata = {
  title: "多元學習資源列表｜島島阿學",
};

export default async function ResourcePage() {
  let data: ResourceListResponse | undefined;
  let jsonLd: JsonLdType | undefined;

  try {
    const [, response] = await getResourceListData({ limit: 4 });
    const responseData = response?.data as { data?: ResourceListResponse } | undefined;

    if (
      responseData?.data &&
      "resources" in responseData.data &&
      "pagination" in responseData.data
    ) {
      data = responseData.data;
      jsonLd = JsonLdFactory.createGraph([
        JsonLdFactory.createItemListBuilder()
          .setName("多元學習資源列表")
          .setItems(data.resources.map(createResourceJsonLd)),
      ]);
    }
  } catch {
    // Error handling: data will be undefined if API call fails
  }

  return <ResourceListPageWidget data={data} jsonLd={jsonLd} />;
}
