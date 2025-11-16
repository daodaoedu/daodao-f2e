import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { unstable_serialize } from 'swr';
import { ResourceCategoriesPageWidget } from '@/widgets/resources';
import {
  getResourceListData,
  type ResourceListResponse,
} from '@/entities/resource';
import { createResourceJsonLd } from '@/features/resources/utils';
import JsonLdFactory from '@/shared/lib/jsonLd';
import type { JsonLdType } from '@/components/SEOConfig';
import { getResourcePathname } from '@/services/resources/core/api';
import type { ResourceListResponseSchema } from '@/services/resources';
import { ProtectedComponent } from '@/entities/user';

export const metadata: Metadata = {
  title: '所有分類｜島島阿學',
};

export default async function ResourceCategoriesPage() {
  let fallback: Record<string, ResourceListResponseSchema[]> | undefined;
  let jsonLd: JsonLdType | undefined;

  try {
    const searchParams = { limit: 4 };
    const [, response] = await getResourceListData(searchParams);
    const responseData = response?.data as { data?: ResourceListResponse } | undefined;

    if (responseData?.data && 'resources' in responseData.data && 'pagination' in responseData.data) {
      jsonLd = JsonLdFactory.createGraph([
        JsonLdFactory.createItemListBuilder()
          .setName('所有分類')
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
    }
  } catch {
    redirect('/resource');
  }

  return (
    <ProtectedComponent>
      <ResourceCategoriesPageWidget fallback={fallback} jsonLd={jsonLd} />
    </ProtectedComponent>
  );
}

