import { useEffect, useState } from "react";

const BREAKPOINTS = {
  xs: 384,
  sm: 640,
  md: 768,
  lg: 1024,
};

function useBaseMediaQuery(query: string) {
  const [isAtLeast, setIsAtLeast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    setIsAtLeast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsAtLeast(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return isAtLeast;
}

export default function useMediaQuery() {
  const isAtLeastXs = useBaseMediaQuery(`(min-width: ${BREAKPOINTS.xs}px)`);
  const isAtLeastSm = useBaseMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isAtLeastMd = useBaseMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isAtLeastLg = useBaseMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);

  return {
    screens: {
      xs: isAtLeastXs,
      sm: isAtLeastSm,
      md: isAtLeastMd,
      lg: isAtLeastLg,
    },
  };
}
