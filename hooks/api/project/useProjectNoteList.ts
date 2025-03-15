import useSWR from 'swr';
import {
  getProjectNotePathname,
  ProjectNoteSchema,
} from '@/services/projects/notes';

import useProjectNote from './useProjectNote';

interface UseProjectNoteListOptions {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectNoteList(
  projectId?: string,
  options?: UseProjectNoteListOptions
) {
  const swrKey = projectId ? getProjectNotePathname({ projectId }) : null;

  const { mutate, ...swr } = useSWR<ProjectNoteSchema[]>(swrKey);

  const mutations = useProjectNote({
    mutateKey: swrKey,
    ...options,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
