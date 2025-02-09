import useSWR from 'swr';
import { getProjectEndpoint } from '@/services/project';

interface UseProjectQueryProps {
  isMe?: boolean;
  projectId?: string;
}

export default function useProjectQuery({
  isMe,
  projectId,
}: UseProjectQueryProps = {}) {
  return useSWR(projectId || isMe ? getProjectEndpoint({ isMe, projectId }) : null);
}
