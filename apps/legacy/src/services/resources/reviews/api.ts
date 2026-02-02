import type { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/shared/lib/helper";
import { mutations } from "@/shared/lib/http";
import type { ResourceReviewFormSchema, ResourceReviewResponseSchema } from "./schema";

export type ResourceReviewSWRKey = string;

interface GetResourceReviewPathnameProps {
  resourceId: string;
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
