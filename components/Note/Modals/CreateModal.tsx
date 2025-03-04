import Modal from '@/shared/components/Modal';
import { CreateProjectNoteRequest } from '@/services/projects/notes';
import marathonConfig from '@/constants/marathon';
import NoteForm from '../Form';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  isLoading: boolean;
  onSubmit: (data: CreateProjectNoteRequest) => void;
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
      <NoteForm
        projectId={projectId}
        projectTitle={projectTitle}
        week={marathonConfig.getWeekNumber()}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

export default CreateModal;
