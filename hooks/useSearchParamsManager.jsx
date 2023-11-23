import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

export default function useSearchParamsManager() {
  const { push } = useRouter();
  const searchParams = useSearchParams();

  const getSearchParams = useCallback(
    (key) =>
      key
        ? (searchParams.get(key) ?? '').split(',').filter(Boolean)
        : Object.fromEntries(searchParams.entries()),
    [searchParams],
  );

  const pushState = useCallback(
    (key, value) => {
      const query = Object.fromEntries(searchParams.entries());
      if (value) query[key] = value;
      else delete query[key];
      push({ query }, undefined, { scroll: false });
    },
    [push, searchParams],
  );

  return [getSearchParams, pushState];
}
