import { useCallback, useEffect, useRef } from "react";

interface UseClickOutsideProps {
  setState: (state: boolean) => void;
}

export default function useClickOutside<T extends HTMLElement>({ setState }: UseClickOutsideProps) {
  const ref = useRef<T | null>(null);

  const setRef = useCallback((node: T) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        (e.target instanceof HTMLElement || e.target instanceof SVGElement) &&
        ref.current?.contains?.(e.target)
      ) {
        return;
      }
      setState(false);
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [setState]);

  return { ref, setRef };
}
