import Modal from '@/shared/components/Modal';
import {
  UpdateProjectReviewRequest,
  ProjectReviewSchema,
} from '@/services/project/reviews';

import ReviewForm from '../Form';

interface UpdateModalProps {
  projectId: string;
  projectTitle: string;
  reviewId: number;
  defaultValues: ProjectReviewSchema;
  week: number;
  createdAt: string;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProjectReviewRequest) => void;
}

export default function UpdateModal({
  projectId,
  projectTitle,
  reviewId,
  defaultValues,
  week,
  createdAt,
  isLoading,
  isOpen,
  onClose,
  onSubmit,
}: UpdateModalProps) {
  return (
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <ReviewForm
        id={reviewId}
        projectId={projectId}
        projectTitle={projectTitle}
        week={week}
        createdAt={createdAt}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
