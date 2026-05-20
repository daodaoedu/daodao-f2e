import type { LeaveWithDraftChoice } from "@daodao/ui/hooks/use-leave-with-draft-confirm";

export type { LeaveWithDraftChoice };

export function shouldNavigateOnLeave(choice: LeaveWithDraftChoice): boolean {
  return choice === "save-draft" || choice === "leave";
}

export function shouldSaveDraftOnLeave(choice: LeaveWithDraftChoice): boolean {
  return choice === "save-draft";
}
