import getEnv from '@/utils/env';
import { useEffect, useState } from 'react';

enum BREAKPOINT {
  EMPTY,
  MOBILE,
  DESKTOP,
}

const calculateBreakpoint = () => {
  if (getEnv().isServerSide) {
    return BREAKPOINT.EMPTY;
  }
  return window.innerWidth < 1024 ? BREAKPOINT.MOBILE : BREAKPOINT.DESKTOP;
};

export default function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<BREAKPOINT>(calculateBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(calculateBreakpoint);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isDesktop: breakpoint === BREAKPOINT.DESKTOP,
    isMobile: breakpoint === BREAKPOINT.MOBILE,
  };
}
