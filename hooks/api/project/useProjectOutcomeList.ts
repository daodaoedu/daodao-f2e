import useSWR from 'swr';
import {
  getProjectOutcomeEndpoint,
  ProjectOutcomeSchema,
} from '@/services/projects/outcomes';

import useProjectOutcome from './useProjectOutcome';

interface UseProjectOutcomeListOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectOutcomeList(
  projectId?: string,
  options?: UseProjectOutcomeListOptions
) {
  const swrKey = projectId ? getProjectOutcomeEndpoint({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectOutcomeSchema[]>(swrKey);

  const mutations = useProjectOutcome({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
