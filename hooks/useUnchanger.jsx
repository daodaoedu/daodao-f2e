import { useEffect, useState } from "react";

export default function useUnchanger(target, enabled) {
  const [state, setState] = useState("");
  const [unchange, setUnchange] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (enabled) {
        if (target === state) {
          setUnchange(true);
        } else {
          setState(target);
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, state]);

  return unchange;
}
