import useSWR from 'swr';
import { getTagsPathname } from './api';

export function useTags() {
  return useSWR<string[]>(getTagsPathname());
}
