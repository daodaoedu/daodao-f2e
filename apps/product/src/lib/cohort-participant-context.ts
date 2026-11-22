export interface CohortParticipantPracticeRef {
  userId: number;
  practiceId: number;
}

/** Invalid lists are rejected intact so the caller's index never shifts to another person. */
export function parseCohortParticipantRefs(value: string | null): CohortParticipantPracticeRef[] {
  if (!value) return [];
  const result: CohortParticipantPracticeRef[] = [];
  const seenUsers = new Set<number>();
  for (const entry of value.split(",")) {
    if (!/^[1-9]\d*:[1-9]\d*$/.test(entry)) return [];
    const [userId, practiceId] = entry.split(":").map(Number);
    if (
      userId === undefined ||
      practiceId === undefined ||
      !Number.isSafeInteger(userId) ||
      !Number.isSafeInteger(practiceId) ||
      seenUsers.has(userId)
    )
      return [];
    seenUsers.add(userId);
    result.push({ userId, practiceId });
  }
  return result;
}
