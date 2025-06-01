import useSWRMutation from "swr/mutation";
import Modal from "@/shared/components/Modal";
import {
  getProjectOutcomePathname,
  projectOutcomeAPI,
  refetchProjectOutcome,
} from "@/services/modules/projects";
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
    <Modal
      size="md"
      className="rounded-2xl"
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
    >
      <OutcomeForm
        projectTitle={projectTitle}
        week={marathonConfig.getWeekNumber()}
        onSubmit={createMutation.trigger}
        isLoading={createMutation.isMutating}
      />
    </Modal>
  );
}
