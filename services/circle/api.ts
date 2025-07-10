import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { fetcher, mutations } from "@/utils/http";

import {
  CircleDetailResponseSchema,
  CircleFormSchema,
  CircleListResponseSchema,
  CircleSchema,
  CircleSearchParamsSchema,
} from "./schema";
import { formatCircleData } from "./utils";

export type CircleSWRKey = string;

interface GetCirclePathnameProps {
  id?: string;
}

export const getCirclePathname = ({ id }: GetCirclePathnameProps = {}) => {
  const pathname = "/circles";

  if (id) {
    return `${pathname}/${parseToString(id)}`;
  }

  return pathname;
};

export const refetchCircle = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getCirclePathname());
  });
};

interface CircleAPIType {
  read: (resourceId: string) => Promise<CircleDetailResponseSchema>;
  readList: (
    query?: CircleSearchParamsSchema
  ) => Promise<CircleListResponseSchema>;
  create: MutationFetcher<CircleSchema, string, CircleFormSchema>;
  update: MutationFetcher<CircleSchema, string, CircleFormSchema>;
  delete: MutationFetcher<void, string>;
}

export const circleAPI: CircleAPIType = {
  read: (id) =>
    fetcher<CircleDetailResponseSchema>(getCirclePathname({ id })).then(
      (data) => ({
        ...data,
        data: data.data.map(formatCircleData),
      })
    ),
  readList: (query) =>
    fetcher<CircleListResponseSchema>([getCirclePathname(), query]).then(
      (data) => ({
        ...data,
        data: data.data.map(formatCircleData),
      })
    ),
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
