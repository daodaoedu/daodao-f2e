import Modal from '@/shared/components/Modal';
import { CreateIdeaRequest } from '@/services/ideas';
import IdeaForm from '../Form';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onSubmit: (data: CreateIdeaRequest) => void;
}

function CreateModal({
  isOpen,
  onClose,
  isLoading,
  onSubmit,
}: CreateModalProps) {
  return (
    <Modal size="md" className="rounded-2xl" isOpen={isOpen} onClose={onClose} hasCloseButton>
      <IdeaForm
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

export default CreateModal;