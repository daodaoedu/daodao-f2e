import useSWR from "swr";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

import {
  getResourcePathname,
  resourceAPI,
  ResourceListResponseSchema,
  ResourceDetailResponseSchema,
  ResourceMutationResponseSchema,
  refetchResource,
} from "@/services/resources";

// 獲取資源列表的 hook
export function useResources() {
  return useSWR<ResourceListResponseSchema>(getResourcePathname());
}

// 獲取單個資源的 hook
export function useResource(id?: number | null) {
  return useSWR<ResourceDetailResponseSchema>(
    id ? getResourcePathname({ id }) : null
  );
}

type SWRMutationOptions<T = ResourceMutationResponseSchema> =
  SWRMutationConfiguration<T, Error, string | null>;

export const useCreateResource = ({
  onSuccess,
  ...options
}: SWRMutationOptions = {}) => {
  return useSWRMutation(getResourcePathname(), resourceAPI.create, {
    ...options,
    onSuccess: (data, key, config) => {
      onSuccess?.(data, key, config);
      refetchResource();
    },
  });
};

export const useUpdateResource = (
  id: number,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => {
  return useSWRMutation(
    id ? getResourcePathname({ id }) : null,
    resourceAPI.update,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchResource();
      },
    }
  );
};

export const useDeleteResource = (
  id: number,
  { onSuccess, ...options }: SWRMutationOptions<void> = {}
) => {
  return useSWRMutation(
    id ? getResourcePathname({ id }) : null,
    resourceAPI.delete,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchResource();
      },
    }
  );
};
