import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { mutations } from "@/utils/http";

import {
  CreateResourceFormSchema,
  UpdateResourceFormSchema,
  ResourceMutationResponseSchema,
} from "./schema";

export type ResourceSWRKey = string;

interface GetResourcePathnameProps {
  id?: number;
}

export const getResourcePathname = ({ id }: GetResourcePathnameProps = {}) => {
  const pathname = "/resources";

  if (id) {
    return `${pathname}/${parseToString(id)}`;
  }

  return pathname;
};

interface ResourceAPIType {
  create: MutationFetcher<
    ResourceMutationResponseSchema,
    ResourceSWRKey,
    CreateResourceFormSchema
  >;
  update: MutationFetcher<
    ResourceMutationResponseSchema,
    ResourceSWRKey,
    UpdateResourceFormSchema
  >;
  delete: MutationFetcher<void, ResourceSWRKey, { id: number }>;
}

export const resourceAPI: ResourceAPIType = {
  create: (_, { arg }) =>
    mutations.post<ResourceMutationResponseSchema>(getResourcePathname(), arg),

  update: (_, { arg: { id, ...arg } }) =>
    mutations.put<ResourceMutationResponseSchema>(
      getResourcePathname({ id }),
      arg
    ),

  delete: (_, { arg }) => mutations.delete<void>(getResourcePathname(arg)),
};
