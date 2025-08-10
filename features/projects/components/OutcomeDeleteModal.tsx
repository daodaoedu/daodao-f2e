import useSWRMutation from 'swr/mutation';
import ConfirmModal from '@/shared/components/Confirm';
import {
  getProjectOutcomePathname,
  projectOutcomeAPI,
  refetchProjectOutcome,
} from '@/services/projects';

interface OutcomeDeleteModalProps {
  projectId: string;
  outcomeId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OutcomeDeleteModal({
  projectId,
  outcomeId,
  isOpen,
  onClose,
  onSuccess,
}: OutcomeDeleteModalProps) {
  const deleteMutation = useSWRMutation(
    projectId && typeof outcomeId === 'number'
      ? getProjectOutcomePathname({ projectId, outcomeId })
      : null,
    projectOutcomeAPI.delete,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectOutcome();
      },
    }
  );

  return (
    <ConfirmModal
      title="確認刪除學習成果"
      confirmText="確認刪除"
      confirmColor="alert"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={deleteMutation.trigger}
      isLoading={deleteMutation.isMutating}
    />
  );
}
