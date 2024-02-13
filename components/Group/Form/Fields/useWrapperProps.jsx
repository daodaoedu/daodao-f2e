import { useId } from 'react';

export default function useWrapperProps({ required, label, tooltip }) {
  const id = useId();
  const formItemId = `form-item-${id}`;

  return { id: formItemId, required, label, tooltip };
}
