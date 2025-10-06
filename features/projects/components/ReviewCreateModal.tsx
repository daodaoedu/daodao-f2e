import useSWRMutation from 'swr/mutation';
import ResponsiveModal, { ResponsiveModalSize } from '@/shared/ui/responsive-modal';
import {
  getProjectReviewPathname,
  projectReviewAPI,
  refetchProjectReview,
} from '@/services/projects';
import marathonConfig from '@/constants/marathon';
import ReviewForm from './ReviewForm';

interface ReviewCreateModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewCreateModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: ReviewCreateModalProps) {
  const createMutation = useSWRMutation(
    projectId ? getProjectReviewPathname({ projectId }) : null,
    projectReviewAPI.create,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectReview();
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
      <ReviewForm
        projectTitle={projectTitle}
        week={marathonConfig.getWeekNumber()}
        onSubmit={createMutation.trigger}
        isLoading={createMutation.isMutating}
      />
    </ResponsiveModal>
  );
}
