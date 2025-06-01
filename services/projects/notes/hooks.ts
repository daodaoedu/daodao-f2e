import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { projectNoteAPI, getProjectNotePathname } from "./api";
import { ProjectNoteSchema } from "./schema";
import { getProjectPathname } from "../core";

export function useProjectNotes(projectId?: string | null) {
  return useSWR<ProjectNoteSchema[]>(
    projectId ? getProjectNotePathname({ projectId }) : null
  );
}

interface UseProjectNoteProps {
  projectId?: string | null;
  noteId?: number | null;
}

export function useProjectNote({ projectId, noteId }: UseProjectNoteProps) {
  return useSWR<ProjectNoteSchema>(
    projectId && typeof noteId === "number"
      ? getProjectNotePathname({ projectId, noteId })
      : null
  );
}

interface UseProjectNoteMutationProps extends UseProjectNoteProps {
  onCreated?: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export function useProjectNoteMutation({
  projectId,
  noteId,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectNoteMutationProps = {}) {
  const swrKey = projectId
    ? getProjectNotePathname({ projectId, noteId })
    : getProjectPathname();

  const createMutation = useSWRMutation(swrKey, projectNoteAPI.create, {
    onSuccess: onCreated,
  });

  const updateMutation = useSWRMutation(swrKey, projectNoteAPI.update, {
    onSuccess: onUpdated,
  });

  const deleteMutation = useSWRMutation(swrKey, projectNoteAPI.delete, {
    onSuccess: onDeleted,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
