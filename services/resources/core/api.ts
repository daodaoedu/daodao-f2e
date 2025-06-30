import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { fetcher, mutations } from "@/utils/http";

import {
  ResourceFormSchema,
  ResourceMutationResponseSchema,
  ResourceListResponseSchema,
  ResourceDetailResponseSchema,
  ResourceSearchParamsSchema,
} from "./schema";

interface GetResourcePathnameProps {
  resourceId?: string;
}

export const getResourcePathname = ({
  resourceId,
}: GetResourcePathnameProps = {}) => {
  const pathname = "/api/v1/resources";

  if (resourceId) {
    return `${pathname}/${parseToString(resourceId)}`;
  }

  return pathname;
};

export const refetchResource = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getResourcePathname());
  });
};

interface ResourceAPIType {
  read: (resourceId: string) => Promise<{ data: ResourceDetailResponseSchema }>;
  readList: (
    query?: ResourceSearchParamsSchema
  ) => Promise<{ data: ResourceListResponseSchema }>;
  create: MutationFetcher<
    ResourceMutationResponseSchema,
    string,
    ResourceFormSchema
  >;
  update: MutationFetcher<
    ResourceMutationResponseSchema,
    string,
    ResourceFormSchema
  >;
  delete: MutationFetcher<void, string, { id: number }>;
}

export const resourceAPI: ResourceAPIType = {
  read: (resourceId) => fetcher(getResourcePathname({ resourceId })),
  readList: (query) => fetcher([getResourcePathname(), query]),
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
