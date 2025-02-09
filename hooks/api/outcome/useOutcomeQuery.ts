import useSWR from 'swr';
import {
  getProjectOutcomeEndpoint,
  ProjectOutcomeSchema,
} from '@/services/project/outcomes';

import useProjectOutcomeMutation from './useOutcomeMutation';

interface UseProjectOutcomeQueryOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectOutcomeQuery(
  projectId?: string,
  options?: UseProjectOutcomeQueryOptions
) {
  const swrKey = projectId ? getProjectOutcomeEndpoint({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectOutcomeSchema[]>(swrKey);

  const mutations = useProjectOutcomeMutation({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
