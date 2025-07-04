import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {
  projectReviewAPI,
  getProjectReviewPathname,
} from "@/services/projects/reviews/api";
import { ProjectReviewSchema } from "@/services/projects/reviews/schema";

export function useProjectReviewList(projectId?: string | null) {
  return useSWR<ProjectReviewSchema[]>(
    projectId ? getProjectReviewPathname({ projectId }) : null
  );
}

interface UseProjectReviewProps {
  projectId?: string | null;
  reviewId?: number | null;
}

export function useProjectReview({
  projectId,
  reviewId,
}: UseProjectReviewProps) {
  return useSWR<ProjectReviewSchema>(
    projectId && typeof reviewId === "number"
      ? getProjectReviewPathname({ projectId, reviewId })
      : null
  );
}

interface UseProjectReviewMutationProps extends UseProjectReviewProps {
  onCreated?: () => void;
}

export function useProjectReviewMutation({
  projectId,
  onCreated,
}: UseProjectReviewMutationProps = {}) {
  const createMutation = useSWRMutation(
    projectId ? getProjectReviewPathname({ projectId }) : null,
    projectReviewAPI.create,
    {
      onSuccess: onCreated,
    }
  );

  return {
    createMutation,
  };
}
