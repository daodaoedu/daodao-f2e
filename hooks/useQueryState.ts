import { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { z } from "zod";

const formatQuery = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  value: z.infer<T>,
  skipFalsy = false
) => {
  const parsed = schema.safeParse(value);

  if (parsed.error) {
    console.error(parsed.error);
  }

  return Object.keys(schema.shape).reduce((acc, key) => {
    const keySchema = schema.shape[key];
    const parsedValue = keySchema.safeParse(value[key]);
    if (parsedValue.success && (!skipFalsy || parsedValue.data)) {
      Object.assign(acc, { [key]: parsedValue.data });
    }
    return acc;
  }, {} as z.infer<T>);
};

export default function useQueryState<T extends z.AnyZodObject>(schema: T) {
  const { query, pathname, push } = useRouter();

  const state = useMemo<z.infer<T>>(() => formatQuery(schema, query), [query]);

  const setState = useCallback(
    (value: z.infer<T> | ((prevState: z.infer<T>) => z.infer<T>)) => {
      const newValue = typeof value === "function" ? value(state) : value;
      const newQuery = formatQuery(schema, newValue, true);
      push({ pathname, query: newQuery }, undefined, { scroll: false });
    },
    [state, pathname, push]
  );

  return [state, setState] as const;
}
