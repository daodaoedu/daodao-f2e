import useSWR from 'swr';
import { getProjectEndpoint } from '@/services/project';
import { Project } from '@/components/Projects/Project/type';
import useProject from './useProject';

interface UseProjectListProps {
  isMe: boolean;
  onCreated?: (data: Project) => void;
  onUpdated?: (data: Project) => void;
  onDeleted?: () => void;
}

export default function useProjectList(
  { isMe, onCreated, onUpdated, onDeleted }: UseProjectListProps = {
    isMe: false,
  }
) {
  const swrKey = getProjectEndpoint({ isMe });
  const { mutate, ...swr } = useSWR<Project[]>(swrKey);

  const mutations = useProject({
    mutateKey: swrKey,
    onCreated,
    onUpdated,
    onDeleted,
  });

  return {
    ...mutations,
    ...swr,
    mutate,
  };
}
