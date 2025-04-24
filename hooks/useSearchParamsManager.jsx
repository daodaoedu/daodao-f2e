import { useCallback } from 'react';
import { useRouter } from 'next/router';

export default function useSearchParamsManager() {
  const { push } = useRouter();
  const { query } = useRouter();

  const getSearchParams = useCallback(
    (key) =>
      key
        ? (query[key] ?? '').split(',').filter(Boolean)
        : query,
    [query],
  );

  const pushState = useCallback(
    (key, value) => {
      if (value) query[key] = value;
      else delete query[key];
      push({ query }, undefined, { scroll: false });
    },
    [push, query],
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
    [],
  );

  return [getSearchParams, pushState, generateParamsItems];
}
