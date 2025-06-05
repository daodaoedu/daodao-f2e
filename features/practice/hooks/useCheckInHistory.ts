import useSWR from 'swr';
import { PracticeStorage } from '@/services/modules/practice/storage';
import { CheckInService } from '@/services/modules/practice/checkIn';

// 簽到歷史的 Hook
export function useCheckInHistory(practiceId: string | undefined) {
  const { data: practice } = useSWR(
    practiceId ? `practice/${practiceId}` : null,
    () => {
      if (!practiceId) return null;
      return PracticeStorage.getPracticeById(practiceId);
    }
  );

  const checkInHistory = practice ? CheckInService.formatCheckInHistory(practice) : [];

  return {
    checkIns: checkInHistory,
    practice
  };
}
