import useSWRMutation from "swr/mutation";
import ConfirmModal from "@/shared/components/Confirm";
import {
  getProjectReviewPathname,
  projectReviewAPI,
  refetchProjectReview,
} from "@/services/modules/projects";

interface ReviewDeleteModalProps {
  projectId: string;
  reviewId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewDeleteModal({
  projectId,
  reviewId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewDeleteModalProps) {
  const deleteMutation = useSWRMutation(
    projectId && typeof reviewId === "number"
      ? getProjectReviewPathname({ projectId, reviewId })
      : null,
    projectReviewAPI.delete,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectReview();
      },
    }
  );

  return (
    <ConfirmModal
      title="確認刪除覆盤"
      confirmText="確認刪除"
      confirmColor="alert"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={deleteMutation.trigger}
      isLoading={deleteMutation.isMutating}
    />
  );
}
