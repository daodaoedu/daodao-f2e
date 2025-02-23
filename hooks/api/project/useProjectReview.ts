import useSWR from 'swr';
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

  const { data, ...swr } = useSWR<ProjectReviewSchema>(swrKey);

  const create = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: CreateProjectReviewRequest }) =>
      createProjectReview(arg),
    { onSuccess: onCreated }
  );

  const update = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: UpdateProjectReviewRequest }) =>
      updateProjectReview(arg),
    { onSuccess: onUpdated }
  );

  const remove = useSWRMutation(
    swrKey ?? mutateKey,
    (url, { arg }: { arg: { projectId: string; reviewId: number } }) =>
      deleteProjectReview(arg.projectId, arg.reviewId),
    { onSuccess: onDeleted }
  );

  return {
    ...swr,
    data,
    create,
    update,
    remove,
  };
}
