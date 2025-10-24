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
    {
      onSuccess: (response) => {
        if (response?.data) {
          // Update cache for the newly created project
          mutate(
            getProjectPathname({ id: response.data.id }),
            response.data,
            { revalidate: false }
          );
          // Invalidate the project list to refresh it
          mutate(getProjectPathname({ isMe: true }));

          if (onCreated) {
            onCreated(response.data);
          }
        }
      },
    }
  );

  const updateMutation = useSWRMutation(
    getProjectPathname({ isMe: true }),
    projectAPI.update,
    {
      onSuccess: (response) => {
        if (response?.data) {
          // Update cache for the updated project
          mutate(
            getProjectPathname({ id: response.data.id }),
            response.data,
            { revalidate: false }
          );
          // Invalidate the project list to refresh it
          mutate(getProjectPathname({ isMe: true }));

          if (onUpdated) {
            onUpdated(response.data);
          }
        }
      },
    }
  );

  const deleteMutation = useSWRMutation(
    getProjectPathname({ isMe: true }),
    projectAPI.delete,
    {
      onSuccess: () => {
        // Invalidate the project list to refresh it
        mutate(getProjectPathname({ isMe: true }));

        if (onDeleted) {
          onDeleted();
        }
      }
    }
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
