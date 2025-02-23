import Modal from '@/shared/components/Modal';
import { UpdateProjectNoteRequest } from '@/services/project/notes';
import NoteForm from '../Form';

interface UpdateModalProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  week: number;
  createdAt?: string;
  isLoading: boolean;
  defaultValues?: UpdateProjectNoteRequest;
  onSubmit: (data: UpdateProjectNoteRequest) => void;
}

function UpdateModal({
  id,
  isOpen,
  onClose,
  projectId,
  projectTitle,
  week,
  createdAt,
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
      <NoteForm
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
