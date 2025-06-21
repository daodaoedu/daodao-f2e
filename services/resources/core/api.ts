import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { fetcher, mutations } from "@/utils/http";

import {
  ResourceFormSchema,
  ResourceMutationResponseSchema,
  ResourceListResponseSchema,
  ResourceDetailResponseSchema,
} from "./schema";
import { mockResourceList } from "../mock";

interface GetResourcePathnameProps {
  id?: string;
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
  read: (resourceId) => {
    const id = parseToString(resourceId);
    if (typeof id !== "string") {
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
