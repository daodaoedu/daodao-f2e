import useSWR from 'swr';
import { getProjectEndpoint } from '@/services/project';
import { Project } from '@/components/Projects/Project/type';

interface UseProjectQueryProps {
  isMe?: boolean;
  projectId?: string;
}

export default function useProjectQuery({
  isMe,
  projectId,
}: UseProjectQueryProps = {}) {
  return useSWR<Project[]>(
    projectId || isMe ? getProjectEndpoint({ isMe, projectId }) : null
  );
}
