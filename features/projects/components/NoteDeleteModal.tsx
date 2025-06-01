import useSWRMutation from "swr/mutation";
import ConfirmModal from "@/shared/components/Confirm";
import {
  getProjectNotePathname,
  projectNoteAPI,
  refetchProjectNote,
} from "@/services/projects";

interface NoteDeleteModalProps {
  projectId: string;
  noteId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NoteDeleteModal({
  projectId,
  noteId,
  isOpen,
  onClose,
  onSuccess,
}: NoteDeleteModalProps) {
  const deleteMutation = useSWRMutation(
    projectId && typeof noteId === "number"
      ? getProjectNotePathname({ projectId, noteId })
      : null,
    projectNoteAPI.delete,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectNote();
      },
    }
  );

  return (
    <ConfirmModal
      title="確認刪除便利貼"
      confirmText="確認刪除"
      confirmColor="alert"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={deleteMutation.trigger}
      isLoading={deleteMutation.isMutating}
    />
  );
}
