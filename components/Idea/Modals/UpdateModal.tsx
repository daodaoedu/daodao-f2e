import Modal from '@/shared/components/Modal';
import { UpdateIdeaRequest } from '@/services/ideas';
import IdeaForm from '../Form';

interface UpdateModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  defaultValues?: UpdateIdeaRequest;
  onSubmit: (data: UpdateIdeaRequest) => void;
}

function UpdateModal({
  id,
  isOpen,
  onClose,
  isLoading,
  defaultValues,
  onSubmit,
}: UpdateModalProps) {
  return (
    <Modal size="md" className="rounded-2xl" isOpen={isOpen} onClose={onClose} hasCloseButton>
      <IdeaForm
        id={id}
        isLoading={isLoading}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

export default UpdateModal;
