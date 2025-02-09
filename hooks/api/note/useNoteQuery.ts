import useSWR from 'swr';
import {
  getProjectNoteEndpoint,
  ProjectNoteSchema,
} from '@/services/project/notes';

import useProjectNoteMutation from './useNoteMutation';

interface UseProjectNoteQueryOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectNoteQuery(
  projectId?: string,
  options?: UseProjectNoteQueryOptions
) {
  const swrKey = projectId ? getProjectNoteEndpoint({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectNoteSchema[]>(swrKey);

  const mutations = useProjectNoteMutation({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
