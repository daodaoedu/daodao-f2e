import useSWR from 'swr';
import { getProjectEndpoint } from '@/services/project';
import { Project } from '@/components/Projects/Project/type';

interface UseProjectQueryProps {
  isMe?: boolean;
}

export default function useProjectQuery({
  isMe,
}: UseProjectQueryProps = {}) {
  return useSWR<Project[]>(isMe ? getProjectEndpoint({ isMe }) : null);
}
