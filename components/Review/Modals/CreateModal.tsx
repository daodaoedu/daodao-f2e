import Modal from '@/shared/components/Modal';
import { CreateProjectReviewRequest } from '@/services/project/reviews';
import config from '@/constants/config';
import ReviewForm from '../Form';

interface CreateModalProps {
  projectId: string;
  projectTitle: string;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectReviewRequest) => void;
}

export default function CreateModal({
  projectId,
  projectTitle,
  isLoading,
  isOpen,
  onClose,
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
        week={config.getWeekNumber()}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
