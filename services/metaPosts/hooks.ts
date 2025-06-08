import useSWR from 'swr';

import { fetcherV1 } from '@/utils/http';
import {
  FacebookGroupPostSchema,
  FacebookFanpagePostSchema,
  InstagramPostSchema,
  InstagramStorySchema,
} from './schema';

type WithPayloadData<T> = T & { payload: { data: T } };

const getPayloadData = <T extends { payload: { data: unknown } }>(data: T) => {
  const payloadData = data.payload.data;

  if (Array.isArray(payloadData)) {
    return payloadData;
  }

  throw new Error('Invalid payload data');
};

export function useMetaGroupPost(numOfPosts = 6) {
  return useSWR<FacebookGroupPostSchema[]>(
    `/facebook/group/posts/${numOfPosts}`,
    {
      revalidateIfStale: false,
      fetcher: (key) =>
        fetcherV1<WithPayloadData<FacebookGroupPostSchema[]>>(key).then(
          getPayloadData
        ),
    }
  );
}

export function useMetaFansPagePost(numOfPosts = 6) {
  return useSWR<FacebookFanpagePostSchema[]>(
    `/facebook/fanspage/posts/${numOfPosts}`,
    {
      revalidateIfStale: false,
      fetcher: (key) =>
        fetcherV1<WithPayloadData<FacebookFanpagePostSchema[]>>(key).then(
          getPayloadData
        ),
    }
  );
}

export function useMetaInstagramPost() {
  return useSWR<InstagramPostSchema[]>(
    '/facebook/instagram/media/id%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp%2Clike_count%2Ccaption',
    {
      revalidateIfStale: false,
      fetcher: (key) =>
        fetcherV1<WithPayloadData<InstagramPostSchema[]>>(key).then(
          getPayloadData
        ),
    }
  );
}

export function useMetaInstagramStory() {
  return useSWR<InstagramStorySchema[]>(
    '/facebook/instagram/stories/id%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp%2Clike_count%2Ccaption',
    {
      revalidateIfStale: false,
      fetcher: (key) =>
        fetcherV1<WithPayloadData<InstagramStorySchema[]>>(key).then(
          getPayloadData
        ),
    }
  );
}
