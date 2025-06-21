import useSWR from "swr";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

import {
  getResourcePathname,
  refetchResource,
  resourceAPI,
  ResourceListResponseSchema,
  ResourceDetailResponseSchema,
  ResourceMutationResponseSchema,
  ResourceSearchParamsSchema,
} from "@/services/resources";
import { mockResourceList } from "@/services/resources/mock";

export function useResourceList(filter: ResourceSearchParamsSchema) {
  return useSWR<ResourceListResponseSchema>([getResourcePathname(), filter], () => mockResourceList);
}

export function useResource(id?: string | null) {
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
  id?: string | null,
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
  id: string,
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
