import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_serialize } from 'swr';
import { ResourceCategoriesDetailPageWidget } from '@/widgets/resources';
import {
  parseCategoryHierarchy,
  createResourceJsonLd,
} from '@/features/resources/utils';
import JsonLdFactory from '@/shared/lib/jsonLd';
import { parseToArray } from '@/shared/lib/helper';
import {
  getResourceListData,
  type ResourceListResponse,
} from '@/entities/resource';
import type { JsonLdType } from '@/components/SEOConfig';
import { getResourcePathname } from '@/services/resources/core/api';
import type { ResourceListResponseSchema } from '@/services/resources';
import { ProtectedComponent } from '@/entities/user';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categories?: string[] }>;
}): Promise<Metadata> {
  const { categories } = await params;
  const [majorCategory, subCategory = null] = parseCategoryHierarchy(
    parseToArray(categories)
  );

  if (!majorCategory) {
    return {
      title: '分類頁面｜島島阿學',
    };
  }

  const title = subCategory?.label ?? majorCategory.label;

  return {
    title: `${title}學習資源列表｜島島阿學`,
  };
}

export default async function ResourceCategoriesDetailPage({
  params,
}: {
  params: Promise<{ categories?: string[] }>;
}) {
  const { categories } = await params;
  const [majorCategory, subCategory = null] = parseCategoryHierarchy(
    parseToArray(categories)
  );

  if (!majorCategory) {
    notFound();
  }

  const title = subCategory?.label ?? majorCategory.label;

  let fallback: Record<string, ResourceListResponseSchema[]> | undefined;
  let jsonLd: JsonLdType | undefined;
  let totalEstimate = 0;
  let parentTotalEstimate = 0;

  try {
    const searchParams = {
      majorCategory: majorCategory.value,
      subCategory: subCategory?.value,
    };
    const [, response] = await getResourceListData(searchParams);
    const responseData = response?.data as { data?: ResourceListResponse } | undefined;

    if (responseData?.data && 'resources' in responseData.data && 'pagination' in responseData.data) {
      jsonLd = JsonLdFactory.createGraph([
        JsonLdFactory.createItemListBuilder()
          .setName(`${title}學習資源列表`)
          .setItems(responseData.data.resources.map(createResourceJsonLd)),
      ]);

      // useSWRInfinite 期望的 fallback 格式是数组，key 需要匹配 [pathname, query] 格式
      const swrKey: [string, typeof searchParams] = [
        getResourcePathname(),
        searchParams,
      ];
      fallback = {
        [unstable_serialize(swrKey)]: [{ data: responseData.data }],
      };

      totalEstimate = responseData.data.pagination.totalEstimate ?? 0;
      parentTotalEstimate = responseData.data.pagination.parentTotalEstimate ?? 0;
    }
  } catch {
    // Error handling: fallback will be undefined if API call fails
  }

  return (
    <ProtectedComponent>
      <ResourceCategoriesDetailPageWidget
        fallback={fallback}
        jsonLd={jsonLd}
        majorCategory={majorCategory}
        subCategory={subCategory}
        title={title}
        totalEstimate={totalEstimate}
        parentTotalEstimate={parentTotalEstimate}
      />
    </ProtectedComponent>
  );
}

