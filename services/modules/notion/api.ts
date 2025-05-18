import { fetcherV1 } from '@/services/core';
import { bodyHandler } from '@/utils/notion';
import { NotionDatabaseResultSchema, SearchResultsQuery } from './schema';

const getPayloadData = <T>(data: { payload: T }) => data.payload;

export const notionPath = '/notion/databases';

export const getNotionDatabase = (queryParams: SearchResultsQuery) =>
  fetcherV1<{ payload: NotionDatabaseResultSchema }>(notionPath, {
    method: 'POST',
    body: JSON.stringify(bodyHandler(queryParams)),
  }).then(getPayloadData);
