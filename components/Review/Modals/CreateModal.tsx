import Modal from '@/shared/components/Modal';
import { CreateProjectReviewSchema } from '@/services/modules/projects';
import marathonConfig from '@/constants/marathon';
import ReviewForm from '../Form';

interface CreateModalProps {
  projectId: string;
  projectTitle: string;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectReviewSchema) => void;
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
        week={marathonConfig.getWeekNumber()}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </Modal>
  );
}
