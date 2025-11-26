import { useEffect, useState } from 'react';

const screens = {
  isXSmall: '(min-width: 420px)',
  isSmall: '(min-width: 640px)',
  isMedium: '(min-width: 768px)',
  isLarge: '(min-width: 1025px)',
};

type Breakpoint = keyof typeof screens;

const useMediaQuery = (breakpoint: Breakpoint) => {
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    const query = screens[breakpoint];
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMatch(event.matches);
    };

    setIsMatch(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isMatch;
};

export default useMediaQuery;
