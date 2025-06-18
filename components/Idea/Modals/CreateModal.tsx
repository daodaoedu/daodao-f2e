import ResponsiveModal, { ResponsiveModalSize } from '@/components/ui/responsive-modal';
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
    <ResponsiveModal
      size={ResponsiveModalSize.Medium}
      open={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <IdeaForm
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </ResponsiveModal>
  );
}

export default CreateModal;
