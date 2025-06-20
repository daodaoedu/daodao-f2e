import useSWR from 'swr';
import { PracticeStorage } from '@/services/practice/storage';
import { CheckInService } from '@/services/practice/checkIn';
import { getPracticePathname } from '@/services/practice/api';

// 獲取單個實踐的 Hook
export function usePractice(id: string | undefined) {
  const { data: practice, error, isLoading } = useSWR(
    id ? getPracticePathname({ id }) : null,
    () => {
      if (!id) return null;
      return PracticeStorage.getPracticeById(id);
    }
  );

  const stats = practice ? {
    canCheckInToday: !CheckInService.hasCheckedInToday(practice),
    todayCheckIn: CheckInService.getTodayCheckIn(practice),
    checkInStats: CheckInService.getCheckInStats(practice),
    suggestions: CheckInService.getCheckInSuggestions(practice)
  } : undefined;

  return {
    practice,
    stats,
    loading: isLoading,
    error: error?.message
  };
}
