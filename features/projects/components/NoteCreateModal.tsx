import useSWRMutation from 'swr/mutation';
import ResponsiveModal, { ResponsiveModalSize } from '@/components/ui/responsive-modal';
import {
  getProjectNotePathname,
  projectNoteAPI,
  refetchProjectNote,
} from '@/services/projects';
import marathonConfig from '@/constants/marathon';
import NoteForm from './NoteForm';

interface NoteCreateModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NoteCreateModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: NoteCreateModalProps) {
  const createMutation = useSWRMutation(
    projectId ? getProjectNotePathname({ projectId }) : null,
    projectNoteAPI.create,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectNote();
      },
    }
  );

  return (
    <ResponsiveModal
      size={ResponsiveModalSize.Medium}
      open={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <NoteForm
        projectTitle={projectTitle}
        week={marathonConfig.getWeekNumber()}
        onSubmit={createMutation.trigger}
        isLoading={createMutation.isMutating}
      />
    </ResponsiveModal>
  );
}
