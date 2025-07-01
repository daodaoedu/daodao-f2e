import { useMemo } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
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

export function useResourceList(filter: ResourceSearchParamsSchema) {
  const resourcePathname = getResourcePathname();
  const swrInfinite = useSWRInfinite<ResourceListResponseSchema>(
    (
      pageIndex,
      previousPageData
    ): [string, ResourceSearchParamsSchema] | null => {
      if (previousPageData && !previousPageData.data.resources) return null;

      if (!previousPageData?.data.resources && pageIndex === 0) {
        return [resourcePathname, filter];
      }
      return [
        resourcePathname,
        {
          ...filter,
          cursor: previousPageData?.data.pagination?.next_cursor ?? undefined,
        },
      ];
    }
  );

  const data = useMemo(
    () => swrInfinite.data?.flatMap((page) => page.data.resources) ?? [],
    [swrInfinite.data]
  );

  const lastData = swrInfinite.data?.[swrInfinite.data.length - 1];
  const hasMore = lastData?.data.pagination?.has_more;
  const nextCursor = lastData?.data.pagination?.next_cursor;
  const totalCount = lastData?.data.pagination?.totalEstimate ?? 0;

  return { ...swrInfinite, data, hasMore, nextCursor, totalCount };
}

export function useResource(resourceId?: string | null) {
  return useSWR<ResourceDetailResponseSchema>(
    resourceId ? getResourcePathname({ resourceId }) : null
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
  resourceId?: string | null,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => {
  return useSWRMutation(
    resourceId ? getResourcePathname({ resourceId }) : null,
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
  resourceId: string,
  { onSuccess, ...options }: SWRMutationOptions<void> = {}
) => {
  return useSWRMutation(
    resourceId ? getResourcePathname({ resourceId }) : null,
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
