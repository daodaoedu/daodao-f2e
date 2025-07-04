import { useCallback } from 'react';
import { useRouter } from 'next/router';

// Type definitions
interface KeyObject {
  [key: string]: string[] | 'PASS_STRING';
}

interface ParamsItem {
  key: string;
  values: string[];
}

type GetSearchParams = {
  (key: string): string[];
  (): Record<string, string | string[]>;
};

type PushState = (key: string, value: string) => void;

type GenerateParamsItems = (arr: string[], keyObj?: KeyObject) => ParamsItem[];

type UseSearchParamsManagerReturn = [
  GetSearchParams,
  PushState,
  GenerateParamsItems
];

/**
 * Hook for managing URL search parameters
 * Provides utilities to get, set, and generate search parameters
 */
export default function useSearchParamsManager(): UseSearchParamsManagerReturn {
  const { push } = useRouter();
  const { query } = useRouter();

  const getSearchParams = useCallback(
    ((key?: string) => {
      if (key) {
        const value = query[key];
        if (typeof value === 'string') {
          return value.split(',').filter(Boolean);
        }
        if (Array.isArray(value)) {
          return value;
        }
        return [];
      }
      return query;
    }) as GetSearchParams,
    [query],
  );

  const pushState = useCallback(
    (key: string, value: string) => {
      const newQuery = { ...query };
      if (value) {
        newQuery[key] = value;
      } else {
        delete newQuery[key];
      }
      push({ query: newQuery }, undefined, { scroll: false });
    },
    [push, query],
  );

  const generateParamsItems = useCallback(
    (arr: string[], keyObj: KeyObject = {}): ParamsItem[] => {
      if (!Array.isArray(arr)) return [];
      return arr.reduce<ParamsItem[]>((acc, param) => {
        const values = getSearchParams(param).filter((value) => {
          const keyConfig = keyObj[param];
          if (keyConfig === 'PASS_STRING') {
            return Boolean(value);
          }
          if (Array.isArray(keyConfig)) {
            return keyConfig.includes(value);
          }
          return Boolean(value);
        });
        return [...acc, { key: param, values }];
      }, []);
    },
    [getSearchParams],
  );

  return [getSearchParams, pushState, generateParamsItems];
}
