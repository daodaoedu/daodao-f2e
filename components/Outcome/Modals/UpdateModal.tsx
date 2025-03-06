import Modal from '@/shared/components/Modal';
import { UpdateProjectOutcomeRequest } from '@/services/projects/outcomes';
import OutcomeForm from '../Form';

interface UpdateModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: UpdateProjectOutcomeRequest;
  onSubmit: (data: UpdateProjectOutcomeRequest) => void;
}

function UpdateModal({
  id,
  projectId,
  projectTitle,
  week,
  createdAt,
  isOpen,
  onClose,
  isLoading,
  defaultValues,
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
      <OutcomeForm
        id={id}
        projectId={projectId}
        projectTitle={projectTitle}
        week={week}
        createdAt={createdAt}
        isLoading={isLoading}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

export default UpdateModal;
