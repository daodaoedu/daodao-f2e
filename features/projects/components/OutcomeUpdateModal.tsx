import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import Modal from "@/shared/components/Modal";
import {
  getProjectOutcomePathname,
  projectOutcomeAPI,
  ProjectOutcomeSchema,
  refetchProjectOutcome,
} from "@/services/projects";
import OutcomeForm from "./OutcomeForm";

interface OutcomeUpdateModalProps {
  outcomeId: number;
  projectId: string;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OutcomeUpdateModal({
  outcomeId,
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onSuccess,
}: OutcomeUpdateModalProps) {
  const { data: outcome } = useSWR<ProjectOutcomeSchema>(
    projectId && typeof outcomeId === "number"
      ? getProjectOutcomePathname({ projectId, outcomeId })
      : null
  );

  const updateMutation = useSWRMutation(
    projectId && typeof outcomeId === "number"
      ? getProjectOutcomePathname({ projectId, outcomeId })
      : null,
    projectOutcomeAPI.update,
    {
      onSuccess: () => {
        onSuccess?.();
        refetchProjectOutcome();
      },
    }
  );

  if (!outcome) return null;

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
        week={outcome.week}
        createdAt={outcome.date}
        defaultValues={outcome}
        isLoading={updateMutation.isMutating}
        onSubmit={updateMutation.trigger}
      />
    </Modal>
  );
}
