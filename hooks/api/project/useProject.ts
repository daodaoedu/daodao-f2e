import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  createProject,
  CreateProjectRequest,
  deleteProject,
  getProjectEndpoint,
  ProjectSchema,
  updateProject,
  UpdateProjectRequest,
} from '@/services/project';

interface UseProjectOptions {
  id?: string;
  mutateKey?: string | null;
  onCreated?: (data: ProjectSchema) => void;
  onUpdated?: (data: ProjectSchema) => void;
  onDeleted?: () => void;
}

export default function useProject({
  id,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectOptions) {
  const swrKey = id ? getProjectEndpoint({ id }) : null;

  const { mutate, ...swr } = useSWR<ProjectSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectRequest }) => createProject(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectRequest }) => updateProject(arg),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { id: string } }) => deleteProject(arg.id),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    mutate,
    create,
    update,
    remove,
  };
}
