import { MutationFetcher } from "swr/mutation";
import { parseToNumber, parseToString } from "@/utils/helper";
import { fetcher, mutations } from "@/utils/http";

import {
  CreateResourceFormSchema,
  UpdateResourceFormSchema,
  ResourceMutationResponseSchema,
  ResourceListResponseSchema,
  ResourceDetailResponseSchema,
} from "./schema";
import { mockResourceList } from "../mock";

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
  read: (resourceId: string) => Promise<ResourceDetailResponseSchema>;
  readList: () => Promise<ResourceListResponseSchema>;
  create: MutationFetcher<
    ResourceMutationResponseSchema,
    string,
    CreateResourceFormSchema
  >;
  update: MutationFetcher<
    ResourceMutationResponseSchema,
    string,
    UpdateResourceFormSchema
  >;
  delete: MutationFetcher<void, string, { id: number }>;
}

export const resourceAPI: ResourceAPIType = {
  read: (resourceId) => {
    const id = parseToNumber(resourceId);
    if (typeof id !== "number") {
      throw new Error("Invalid resource id");
    }
    return fetcher<ResourceDetailResponseSchema>(
      getResourcePathname({ id })
    ).catch(() => mockResourceList.resources[0]);
  },
  readList: () =>
    fetcher<ResourceListResponseSchema>(getResourcePathname()).catch(
      () => mockResourceList
    ),
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
