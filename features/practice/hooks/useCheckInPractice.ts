import { useCheckInHistory } from './useCheckInHistory';

export function usePracticeCheckInHistory(practiceId: string | undefined) {
  return useCheckInHistory(practiceId);
}

export type UsePracticeCheckInHistoryResult = ReturnType<typeof usePracticeCheckInHistory>;
