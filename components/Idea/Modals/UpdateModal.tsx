import ResponsiveModal, { ResponsiveModalSize } from '@/components/ui/responsive-modal';
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
    <ResponsiveModal
      size={ResponsiveModalSize.Medium}
      open={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <IdeaForm
        id={id}
        isLoading={isLoading}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
    </ResponsiveModal>
  );
}

export default UpdateModal;
