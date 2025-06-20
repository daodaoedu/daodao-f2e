import { useActivePractices } from './useFilteredPractices';

export function useActivePracticeList() {
  const { practices } = useActivePractices();
  return practices;
}

export type UseActivePracticeListResult = ReturnType<typeof useActivePracticeList>;
