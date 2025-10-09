import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import projectAPI, { getProjectPathname, projectAPIClass } from './api';
import { ProjectSchema } from './schema';
import { sortProjects } from '../utils';

export function useMyProjects() {
  const swr = useSWR<ProjectSchema[]>(
    getProjectPathname({ isMe: true }),
    () => projectAPIClass.readMyList(),
    {
      revalidateIfStale: false,
    }
  );

  return {
    ...swr,
    data: swr.data && sortProjects(swr.data),
  };
}

export function usePublicProjects() {
  const swr = useSWR<ProjectSchema[]>(
    getProjectPathname({ isPublic: true }),
    () => projectAPIClass.readPublicList(),
    {
      revalidateIfStale: false,
    }
  );

  return {
    ...swr,
    data: swr.data && sortProjects(swr.data),
  };
}

export function useProject(id?: string | null) {
  return useSWR<ProjectSchema>(
    id ? getProjectPathname({ id }) : null,
    id ? () => projectAPIClass.read(id) : null,
    {
      revalidateIfStale: false,
    }
  );
}

interface UseProjectMutationProps {
  onCreated?: (data?: ProjectSchema) => void;
  onUpdated?: (data?: ProjectSchema) => void;
  onDeleted?: () => void;
}

export function useProjectMutation({
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectMutationProps = {}) {
  const createMutation = useSWRMutation(
    getProjectPathname({ isMe: true }),
    projectAPI.create,
    { onSuccess: onCreated }
  );

  const updateMutation = useSWRMutation(
    getProjectPathname({ isMe: true }),
    projectAPI.update,
    { onSuccess: onUpdated }
  );

  const deleteMutation = useSWRMutation(
    getProjectPathname({ isMe: true }),
    projectAPI.delete,
    { onSuccess: onDeleted }
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
