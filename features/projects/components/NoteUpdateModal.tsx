import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Modal from "@/shared/components/Modal";
import {
  getProjectNotePathname,
  projectNoteAPI,
  ProjectNoteSchema,
  refetchProjectNote,
} from "@/services/modules/projects";
import NoteForm from "./NoteForm";

interface NoteUpdateModalProps {
  noteId: number;
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NoteUpdateModal({
  noteId,
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: NoteUpdateModalProps) {
  const { data: note } = useSWR<ProjectNoteSchema>(
    projectId && typeof noteId === "number"
      ? getProjectNotePathname({ projectId, noteId })
      : null
  );

  const updateMutation = useSWRMutation(
    projectId && typeof noteId === "number"
      ? getProjectNotePathname({ projectId, noteId })
      : null,
    projectNoteAPI.update,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectNote();
      },
    }
  );

  if (!note) return null;

  return (
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <NoteForm
        projectTitle={projectTitle}
        week={note.week}
        createdAt={note.date}
        defaultValues={note}
        isLoading={updateMutation.isMutating}
        onSubmit={updateMutation.trigger}
      />
    </Modal>
  );
}
