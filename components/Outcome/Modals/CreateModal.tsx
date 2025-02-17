import Modal from '@/shared/components/Modal';
import { CreateProjectOutcomeRequest } from '@/services/project/outcomes';
import config from '@/constants/config';
import OutcomeForm from '../Form';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  isLoading: boolean;
  onSubmit: (data: CreateProjectOutcomeRequest) => void;
}

function CreateModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  isLoading,
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
      <OutcomeForm
        projectId={projectId}
        projectTitle={projectTitle}
        week={config.getWeekNumber()}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

export default CreateModal;
