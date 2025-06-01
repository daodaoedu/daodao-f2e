import useSWRMutation from "swr/mutation";
import Modal from "@/shared/components/Modal";
import {
  getProjectReviewPathname,
  projectReviewAPI,
  refetchProjectReview,
} from "@/services/modules/projects";
import marathonConfig from "@/constants/marathon";
import ReviewForm from "./ReviewForm";

interface ReviewCreateModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewCreateModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReviewCreateModalProps) {
  const createMutation = useSWRMutation(
    projectId ? getProjectReviewPathname({ projectId }) : null,
    projectReviewAPI.create,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectReview();
      },
    }
  );

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
        week={marathonConfig.getWeekNumber()}
        onSubmit={createMutation.trigger}
        isLoading={createMutation.isMutating}
      />
    </Modal>
  );
}
