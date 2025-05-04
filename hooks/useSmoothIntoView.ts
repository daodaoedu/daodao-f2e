import { useEffect, useRef } from "react";

/**
 * 當元素在螢幕上時，自動滾動到可見區域
 * @param ref - 元素的 ref
 * @returns 元素的 ref
 */
export default function useSmoothIntoView<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!ref.current || window.innerWidth > 1023) return;
      if (ref.current.dataset.active !== 'true') return;
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return ref;
}
