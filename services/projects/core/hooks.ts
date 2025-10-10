import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

import projectAPI, { getProjectPathname, projectAPIClass } from './api';
import { ProjectSchema } from './schema';
import { sortProjects } from '../utils';

export function useMyProjects() {
  const swr = useSWR<ProjectSchema[]>(
    getProjectPathname({ isMe: true }),
    async () => {
      const data = await projectAPIClass.readMyList();
      // Populate individual project cache immediately
      data.forEach((project) => {
        mutate(getProjectPathname({ id: project.id }), project, { revalidate: false });
      });
      return data;
    },
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
    async () => {
      const data = await projectAPIClass.readPublicList();
      // Populate individual project cache immediately
      data.forEach((project) => {
        mutate(getProjectPathname({ id: project.id }), project, { revalidate: false });
      });
      return data;
    },
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
  const key = id ? getProjectPathname({ id }) : null;

  return useSWR<ProjectSchema>(
    key,
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
