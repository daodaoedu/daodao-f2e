import useSWR from 'swr';
import { getIdeaEndpoint, IdeaSchema } from '@/services/ideas';
import { useIdeaActions } from '@/features/ideas/hooks/useIdeaActions';

interface IdeaListResponse {
  data: IdeaSchema[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface UseIdeaListOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function useIdeaList(options?: UseIdeaListOptions) {
  const swrKey = getIdeaEndpoint();
  const { mutate, data, ...swr } = useSWR<IdeaListResponse>(swrKey);
  const mutations = useIdeaActions(options);
  return {
    ...mutations,
    ...swr,
    mutate,
    data,
    pagination: {
      page: data?.page,
      pageSize: data?.pageSize,
      totalCount: data?.totalCount,
      totalPages: data?.totalPages,
    },
  };
}
