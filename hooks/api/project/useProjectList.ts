import useSWR from 'swr';
import { getProjectEndpoint } from '@/services/project';
import { Project } from '@/components/Projects/Project/type';

interface UseProjectListProps {
  isMe?: boolean;
}

export default function useProjectList({ isMe }: UseProjectListProps = {}) {
  return useSWR<Project[]>(isMe ? getProjectEndpoint({ isMe }) : null);
}
