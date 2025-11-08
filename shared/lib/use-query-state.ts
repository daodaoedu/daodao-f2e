import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/shared/i18n/navigation';
import { z } from 'zod';

const validateAndFormatParams = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  value: Record<string, unknown>
) => {
  return Object.keys(schema.shape).reduce(
    (acc, key) => {
      const keySchema = schema.shape[key];
      const parsedValue = keySchema.safeParse(value[key]);

      if (parsedValue.success) {
        Object.assign(acc, { [key]: parsedValue.data });
      }
      return acc;
    },
    {} as Partial<z.infer<T>>
  );
};

const isDeepEqual = <T>(prev: T, next: T): boolean => {
  if (Array.isArray(prev) && Array.isArray(next)) {
    if (prev.length !== next.length) {
      return false;
    }
    return prev.every((item, index) => isDeepEqual(item, next[index]));
  }
  if (Array.isArray(prev) || Array.isArray(next)) {
    return false;
  }
  if (prev && next && typeof prev === 'object' && typeof next === 'object') {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    return prevKeys.every((key) => {
      const prevValue = prev[key as keyof typeof prev];
      const nextValue = next[key as keyof typeof next];
      return isDeepEqual(prevValue, nextValue);
    });
  }
  if (Number.isNaN(prev) && Number.isNaN(next)) {
    return true;
  }
  return prev === next;
};

const objectToSearchParams = (obj: Record<string, unknown>): string => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value != null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item.toString()));
      } else {
        params.set(key, value.toString());
      }
    }
  });

  return params.toString();
};

const searchParamsToObject = (
  searchParams: URLSearchParams | null
): Record<string, unknown> => {
  const obj: Record<string, unknown> = {};

  if (!searchParams) {
    return obj;
  }

  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (obj[key]) {
      if (Array.isArray(obj[key])) {
        obj[key].push(value);
      } else {
        obj[key] = [obj[key], value];
      }
    } else {
      obj[key] = value;
    }
  });

  return obj;
};

export default function useQueryState<T extends z.AnyZodObject>(schema: T) {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => validateAndFormatParams(schema, searchParamsToObject(searchParams)),
    [searchParams, schema]
  );

  const prevQueryRef = useRef(state);

  const setState = useCallback<Dispatch<SetStateAction<z.infer<T>>>>(
    (value) => {
      const nextState = value instanceof Function ? value(state) : value;
      const validatedQuery = validateAndFormatParams(schema, nextState);

      if (isDeepEqual(prevQueryRef.current, validatedQuery)) {
        return;
      }
      const queryString = objectToSearchParams(validatedQuery);
      const { pathname } = window.location;
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      push(newUrl, { scroll: false });

      prevQueryRef.current = validatedQuery;
    },
    [state, push, schema]
  );

  return [state, setState] as const;
}
