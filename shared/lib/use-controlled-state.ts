'use client';

import { Dispatch, SetStateAction, useCallback, useState } from 'react';

export default function useControlledState<T>(
  initialState: T,
  controlledState?: T,
  onChange?: (value: T) => void
) {
  const [internalState, setInternalState] = useState<T>(
    controlledState ?? initialState
  );

  const isControlled = controlledState !== undefined;

  const state = isControlled ? controlledState : internalState;

  const setState = useCallback<Dispatch<SetStateAction<T>>>(
    (value) => {
      const newValue = value instanceof Function ? value(state) : value;

      if (!Object.is(state, newValue)) {
        onChange?.(newValue);
      }
      if (!isControlled) {
        setInternalState(value);
      }
    },
    [state, isControlled, onChange]
  );

  return [state, setState] as const;
}
