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

  const generateParamsItems = useCallback(
    (arr, keyObj = {}) => {
      if (!Array.isArray(arr)) return [];
      return arr.reduce((acc, param) => {
        const values = getSearchParams(param).filter((value) =>
          keyObj[param] === 'PASS_STRING'
            ? value
            : keyObj[param]?.includes(value),
        );
        return [...acc, { key: param, values }];
      }, []);
    },
    [searchParams],
  );

  return [getSearchParams, pushState, generateParamsItems];
}
