import { Dispatch, SetStateAction, useCallback, useState } from "react";

const isSetStateActionFn = <T>(value: unknown): value is (prevState: T) => T =>
  typeof value === "function";

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
      const newValue = isSetStateActionFn<T>(value) ? value(state) : value;

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
