import practiceAPI from '@/services/practice/api';
import type { UpdatePracticeInput, CheckInInput } from '@/services/practice/schema';
import { invalidateAllCaches } from './utils';

// 更新單個實踐的便利 Hook
export function usePracticeUpdater(practiceId: string | undefined) {
  const updatePractice = async (updates: UpdatePracticeInput) => {
    if (!practiceId) return undefined;
    const result = await practiceAPI.update(practiceId, updates);
    invalidateAllCaches(practiceId);
    return result;
  };

  const deletePractice = async () => {
    if (!practiceId) return undefined;
    await practiceAPI.delete(practiceId);
    invalidateAllCaches(practiceId);
    return undefined;
  };

  const checkIn = async (input: CheckInInput) => {
    if (!practiceId) return undefined;
    const result = await practiceAPI.checkIn(input);
    invalidateAllCaches(practiceId);
    return result;
  };

  return {
    updatePractice: practiceId ? updatePractice : undefined,
    deletePractice: practiceId ? deletePractice : undefined,
    checkIn: practiceId ? checkIn : undefined,
  };
}
