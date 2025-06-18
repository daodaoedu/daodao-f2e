import useSWRMutation from "swr/mutation";
import ResponsiveModal, { ResponsiveModalSize } from "@/components/ui/responsive-modal";
import {
  getProjectOutcomePathname,
  projectOutcomeAPI,
  refetchProjectOutcome,
} from "@/services/projects";
import marathonConfig from "@/constants/marathon";
import OutcomeForm from "./OutcomeForm";

interface OutcomeCreateModalProps {
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OutcomeCreateModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: OutcomeCreateModalProps) {
  const createMutation = useSWRMutation(
    projectId ? getProjectOutcomePathname({ projectId }) : null,
    projectOutcomeAPI.create,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectOutcome();
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
      <OutcomeForm
        projectTitle={projectTitle}
        week={marathonConfig.getWeekNumber()}
        onSubmit={createMutation.trigger}
        isLoading={createMutation.isMutating}
      />
    </ResponsiveModal>
  );
}
