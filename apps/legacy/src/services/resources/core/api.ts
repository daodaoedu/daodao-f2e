import type { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/shared/lib/helper";
import { fetcher, mutations } from "@/shared/lib/http";

import type {
  ResourceDetailResponseSchema,
  ResourceFormSchema,
  ResourceListResponseSchema,
  ResourceMutationResponseSchema,
  ResourceSearchParamsSchema,
} from "./schema";

interface GetResourcePathnameProps {
  resourceId?: string;
}

export const getResourcePathname = ({ resourceId }: GetResourcePathnameProps = {}) => {
  const pathname = "/api/v1/resources";

  if (resourceId) {
    return `${pathname}/${parseToString(resourceId)}`;
  }

  return pathname;
};

interface ResourceAPIType {
  read: (resourceId: string) => Promise<ResourceDetailResponseSchema>;
  readList: (query?: ResourceSearchParamsSchema) => Promise<ResourceListResponseSchema>;
  create: MutationFetcher<ResourceMutationResponseSchema, string, ResourceFormSchema>;
  update: MutationFetcher<ResourceMutationResponseSchema, string, ResourceFormSchema>;
  delete: MutationFetcher<void, string, { id: number }>;
}

export const resourceAPI: ResourceAPIType = {
  read: (resourceId) => fetcher(getResourcePathname({ resourceId })),
  readList: (query) => fetcher([getResourcePathname(), query]),
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
