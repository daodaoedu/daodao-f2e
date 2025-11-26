import { usePractices } from './usePractices';
import { usePractice } from './usePractice';

export function usePracticeDetail(id: string | undefined) {
  const { loading, error } = usePractices();
  const practiceData = usePractice(id);

  return {
    ...practiceData,
    loading,
    error,
  };
}

export type UsePracticeDetailResult = ReturnType<typeof usePracticeDetail>;
