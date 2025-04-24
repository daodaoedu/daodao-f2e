import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';

import { fetcherV1 } from '@/services/core';
import { bodyHandler } from '@/utils/notion';
import { NotionDatabaseResultSchema } from './schema';

interface SearchResultsQuery {
  q?: string;
  tags?: string | string[];
  cats?: string | string[];
  ages?: string | string[];
  fee?: string;
}

const getPayloadData = <T>(data: { payload: T }) => {
  return data.payload;
};

export function useSearchResults(query: SearchResultsQuery) {
  const { data, ...rest } = useSWRInfinite<NotionDatabaseResultSchema>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.results) return null;

      if (!previousPageData?.results && pageIndex === 0) {
        return ['/notion/databases', bodyHandler(query)];
      }
      return [
        '/notion/databases',
        bodyHandler(query, previousPageData?.next_cursor),
      ];
    },
    ([url, queryParams]) =>
      fetcherV1<{ payload: NotionDatabaseResultSchema }>(url, {
        method: 'POST',
        body: JSON.stringify(queryParams),
      }).then(getPayloadData),
    { revalidateFirstPage: false }
  );

  const searchResults = useMemo(
    () => data?.flatMap((page) => page.results) ?? [],
    [data]
  );

  const lastResult = data?.[data.length - 1];
  const hasMore = lastResult?.has_more;
  const nextCursor = lastResult?.next_cursor;

  return { data, searchResults, hasMore, nextCursor, ...rest };
}

interface RelatedResourcesQuery {
  filter: unknown;
  page_size: number;
}

export function useRelatedResources(params: RelatedResourcesQuery) {
  const { data = [], ...rest } = useSWR<NotionDatabaseResultSchema>(
    ['/notion/databases', params],
    {
      revalidateIfStale: false,
      fetcher: ([url, queryParams]) =>
        fetcherV1<{ payload: NotionDatabaseResultSchema }>(url, {
          method: 'POST',
          body: JSON.stringify(queryParams),
        }).then(getPayloadData),
    }
  );

  return { data, ...rest };
}
