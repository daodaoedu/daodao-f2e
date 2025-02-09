import Modal from '@/shared/components/Modal';
import { CreateProjectReviewRequest } from '@/services/project/reviews';

import ReviewForm from '../Form';

interface CreateModalProps {
  projectId: string;
  projectTitle: string;
  isLoading: boolean;
  isOpen: boolean;
  week: number;
  onClose: () => void;
  onSubmit: (data: CreateProjectReviewRequest) => void;
}

export default function CreateModal({
  projectId,
  projectTitle,
  isLoading,
  isOpen,
  onClose,
  week,
  onSubmit,
}: CreateModalProps) {
  return (
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <ReviewForm
        projectId={projectId}
        projectTitle={projectTitle}
        week={week}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
