import { useRef } from 'react';

export default function useThrottle(delay = 300) {
  const isThrottled = useRef(false);

  const throttle = (callback: () => void) => {
    if (isThrottled.current) return;
    callback();
    isThrottled.current = true;
    setTimeout(() => {
      isThrottled.current = false;
    }, delay);
  };

  return throttle;
}
