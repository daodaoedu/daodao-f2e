import { useCallback, useRef } from 'react';

export default function useDebounce<Args extends unknown[], R>(
  callback: (...args: Args) => R,
  delay: number
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return new Promise((resolve) => {
        timerRef.current = setTimeout(() => {
          resolve(callback(...args));
        }, delay);
      });
    },
    [callback, delay]
  );
}
