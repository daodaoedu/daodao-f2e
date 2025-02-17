import { useCallback } from 'react';
import useSWR from 'swr';
import { Project } from '@/components/Projects/Project/type';
import {
  createProject,
  CreateProjectRequest,
  deleteProject,
  getProjectEndpoint,
  updateProject,
  UpdateProjectRequest,
} from '@/services/project';

export default function useProject(projectId?: string) {
  const { mutate, ...swr } = useSWR<Project>(
    projectId ? getProjectEndpoint({ projectId }) : null
  );

  const handleCreate = useCallback(
    async (project: CreateProjectRequest) => {
      const projectData = await createProject(project);
      return mutate(projectData);
    },
    [mutate]
  );

  const handleUpdate = useCallback(
    async (project: UpdateProjectRequest) => {
      const projectData = await updateProject(project);
      return mutate(projectData);
    },
    [mutate]
  );

  const handleDelete = useCallback(
    async (_projectId: string) => {
      await deleteProject(_projectId);
      return mutate();
    },
    [mutate]
  );

  return {
    ...swr,
    mutate,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
