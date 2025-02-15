import toast from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  CreateProjectReviewRequest,
  ProjectReviewSchema,
  UpdateProjectReviewRequest,
  createProjectReview,
  deleteProjectReview,
  getProjectReviewEndpoint,
  updateProjectReview,
} from '@/services/project/reviews';

interface UseProjectReviewOptions {
  projectId?: string;
  reviewId?: number;
  mutateKey?: string | null;
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function useProjectReview({
  projectId,
  reviewId,
  mutateKey,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectReviewOptions) {
  const swrKey =
    projectId && reviewId
      ? getProjectReviewEndpoint({ projectId, reviewId })
      : null;

  const config = useSWRConfig();
  const { data, ...swr } = useSWR<ProjectReviewSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectReviewRequest }) =>
      createProjectReview(arg),
    {
      onSuccess: onCreated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('新增覆盤失敗');
      },
    }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectReviewRequest }) =>
      updateProjectReview(arg),
    {
      onSuccess: onUpdated,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('更新覆盤失敗');
      },
    }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; reviewId: number } }) =>
      deleteProjectReview(arg.projectId, arg.reviewId),
    {
      onSuccess: onDeleted,
      onError: (error, key) => {
        config.onError?.(error, key, config);
        toast.error('刪除覆盤失敗');
      },
    }
  );

  return {
    ...swr,
    data,
    create,
    update,
    remove,
  };
}
