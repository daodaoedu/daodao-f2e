import useSWR from 'swr';
import { getIdeaEndpoint, IdeaSchema } from '@/services/ideas';
import useIdea from './useIdea';


interface IdeaListResponse {
  data: IdeaSchema[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface UseIdeaListOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useIdeaList(options?: UseIdeaListOptions) {
  const swrKey = getIdeaEndpoint();
  const { mutate,data, ...swr } = useSWR<IdeaListResponse>(swrKey);
  const mutations = useIdea({
    mutateKey: swrKey,
    ...options,
  });
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
