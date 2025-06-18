import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { mutations } from "@/utils/http";

import {
  ResourceReviewFormSchema,
  ResourceReviewResponseSchema,
} from "./schema";

export type ResourceReviewSWRKey = string;

interface GetResourceReviewPathnameProps {
  resourceId: number;
  reviewId?: number;
}

export const getResourceReviewPathname = ({
  resourceId,
  reviewId,
}: GetResourceReviewPathnameProps) => {
  const pathname = `/resources/${parseToString(resourceId)}/reviews`;

  if (reviewId) {
    return `${pathname}/${parseToString(reviewId)}`;
  }

  return pathname;
};

export const refetchResourceReviews = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return (
      typeof pathname === "string" &&
      pathname.includes("/resources/") &&
      pathname.includes("/reviews")
    );
  });
};

interface ResourceReviewAPIType {
  create: MutationFetcher<
    ResourceReviewResponseSchema,
    ResourceReviewSWRKey,
    ResourceReviewFormSchema
  >;
  update: MutationFetcher<
    ResourceReviewResponseSchema,
    ResourceReviewSWRKey,
    ResourceReviewFormSchema
  >;
  delete: MutationFetcher<void, ResourceReviewSWRKey>;
}

export const resourceReviewAPI: ResourceReviewAPIType = {
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
