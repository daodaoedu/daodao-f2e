export type LeaveWithDraftChoice = "save-draft" | "leave" | "continue";

export function shouldNavigateOnLeave(choice: LeaveWithDraftChoice): boolean {
  return choice === "save-draft" || choice === "leave";
}

export function shouldSaveDraftOnLeave(choice: LeaveWithDraftChoice): boolean {
  return choice === "save-draft";
}
