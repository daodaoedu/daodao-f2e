import {
  Dispatch, SetStateAction, useCallback, useMemo, useRef,
} from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';

const formatQuery = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  value: z.infer<T>
) => {
  const parsed = schema.safeParse(value);

  if (parsed.error) {
    console.error(parsed.error);
  }

  return Object.keys(schema.shape).reduce((acc, key) => {
    const keySchema = schema.shape[key];
    const parsedValue = keySchema.safeParse(value[key]);
    if (
      parsedValue.success &&
      parsedValue.data != null &&
      parsedValue.data !== ''
    ) {
      Object.assign(acc, { [key]: parsedValue.data });
    }
    return acc;
  }, {} as z.infer<T>);
};

const isSame = <T>(prev: T, next: T): boolean => {
  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) {
      return false;
    }
    return prev.every((item, index) => isSame(item, next[index]));
  }
  if (Array.isArray(prev) || Array.isArray(next)) {
    return false;
  }
  if (prev && next && typeof prev === 'object' && typeof next === 'object') {
    if (Object.keys(prev).length !== Object.keys(next).length) {
      return false;
    }
    return Object.keys(prev).every((key) => {
      const prevValue = prev[key as keyof typeof prev];
      const nextValue = next[key as keyof typeof next];
      return isSame(prevValue, nextValue);
    });
  }
  if (typeof prev === 'number' && typeof next === 'number') {
    return Number.isNaN(prev) && Number.isNaN(next);
  }
  return prev === next;
};

export default function useQueryState<T extends z.AnyZodObject>(schema: T) {
  const { pathname, query, push } = useRouter();
  const prevQuery = useRef<z.infer<T>>(query);

  const state = useMemo<z.infer<T>>(() => formatQuery(schema, query), [query]);

  const setState = useCallback<Dispatch<SetStateAction<z.infer<T>>>>(
    (value) => {
      const newValue = typeof value === 'function' ? value(state) : value;
      const newQuery = formatQuery(schema, newValue);
      if (!isSame(prevQuery.current, newQuery)) {
        push({ pathname, query: newQuery }, undefined, {
          scroll: false,
        });
      }
      prevQuery.current = newQuery;
    },
    [state, pathname, push]
  );

  return [state, setState] as const;
}
