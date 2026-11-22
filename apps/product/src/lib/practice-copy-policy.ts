interface IPracticeCopyPolicy {
  isCopyRestricted?: boolean;
  isCohortPrivacyLocked?: boolean;
  isCohortPractice?: boolean;
  isChallenge?: boolean;
}

/** Copy restrictions are server facts, independent of the page's navigation mode. */
export function isPracticeCopyRestricted(practice: IPracticeCopyPolicy): boolean {
  return (
    practice.isCopyRestricted === true ||
    practice.isCohortPrivacyLocked === true ||
    practice.isCohortPractice === true ||
    practice.isChallenge === true
  );
}
