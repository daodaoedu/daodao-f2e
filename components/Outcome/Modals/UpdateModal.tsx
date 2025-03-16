import Modal from '@/shared/components/Modal';
import { UpdateProjectOutcomeSchema } from '@/services/modules/projects';
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
  defaultValues?: UpdateProjectOutcomeSchema;
  onSubmit: (data: UpdateProjectOutcomeSchema) => void;
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
