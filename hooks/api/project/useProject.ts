import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  createProject,
  CreateProjectSchema,
  deleteProject,
  getProjectPathname,
  ProjectSchema,
  updateProject,
  UpdateProjectSchema,
} from '@/services/projects';

interface UseProjectOptions {
  id?: string;
  mutateKey?: string | null;
  onCreated?: (data: ProjectSchema) => void;
  onUpdated?: (data: ProjectSchema) => void;
  onDeleted?: () => void;
}

/** @deprecated */
export default function useProject({
  id,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectOptions) {
  const swrKey = id ? getProjectPathname({ id }) : null;

  const { mutate, ...swr } = useSWR<ProjectSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectSchema }) => createProject(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectSchema }) => updateProject(arg),
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
