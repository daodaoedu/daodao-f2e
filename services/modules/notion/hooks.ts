import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';

import { bodyHandler } from '@/utils/notion';
import { NotionDatabaseResultSchema, SearchResultsQuery } from './schema';
import { getNotionDatabase, notionPath } from './api';

export function useSearchResults(query: SearchResultsQuery) {
  const { data, ...rest } = useSWRInfinite<NotionDatabaseResultSchema>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.results) return null;

      if (!previousPageData?.results && pageIndex === 0) {
        return [notionPath, bodyHandler(query)];
      }
      return [notionPath, bodyHandler(query, previousPageData?.next_cursor)];
    },
    ([, queryParams]) => getNotionDatabase(queryParams as SearchResultsQuery),
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

export function useRelatedResources(params: SearchResultsQuery) {
  const { data = [], ...rest } = useSWR<NotionDatabaseResultSchema>(
    ['/notion/databases', params],
    {
      revalidateIfStale: false,
      fetcher: () => getNotionDatabase(params),
    }
  );

  return { data, ...rest };
}
