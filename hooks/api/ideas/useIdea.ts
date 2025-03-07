import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateIdeaRequest,
  IdeaSchema,
  UpdateIdeaRequest,
  createIdea,
  deleteIdea,
  getIdeaEndpoint,
  updateIdea,
} from '@/services/ideas';

interface UseIdeaOptions {
  ideaId?: string;
  mutateKey?: string | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

interface ApiResponse<T> {
  data: T;
}

export default function useIdea({
  ideaId,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseIdeaOptions) {
  const swrKey = ideaId ? getIdeaEndpoint({ ideaId }) : null;
  const { data, ...swr } = useSWR<ApiResponse<IdeaSchema>>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateIdeaRequest }) => createIdea(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateIdeaRequest }) => updateIdea(arg),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { ideaId: string } }) => deleteIdea(arg.ideaId),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    data: data?.data,
    create,
    update,
    remove,
  };
}
