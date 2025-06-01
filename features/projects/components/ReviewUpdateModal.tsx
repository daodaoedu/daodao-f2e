import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Modal from "@/shared/components/Modal";
import {
  ProjectReviewSchema,
  getProjectReviewPathname,
  projectReviewAPI,
  refetchProjectReview,
} from "@/services/modules/projects";

import ReviewForm from "./ReviewForm";

interface ReviewUpdateModalProps {
  projectId: string;
  projectTitle: string;
  reviewId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewUpdateModal({
  projectId,
  projectTitle,
  reviewId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewUpdateModalProps) {
  const { data: review } = useSWR<ProjectReviewSchema>(
    projectId && typeof reviewId === "number"
      ? getProjectReviewPathname({ projectId, reviewId })
      : null
  );

  const updateMutation = useSWRMutation(
    projectId && typeof reviewId === "number"
      ? getProjectReviewPathname({ projectId, reviewId })
      : null,
    projectReviewAPI.update,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectReview();
      },
    }
  );

  if (!review) return null;

  return (
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <ReviewForm
        projectTitle={projectTitle}
        week={review.week}
        createdAt={review.createdAt}
        defaultValues={review}
        onSubmit={updateMutation.trigger}
        isLoading={updateMutation.isMutating}
      />
    </Modal>
  );
}
