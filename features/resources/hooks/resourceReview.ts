import useSWR from "swr";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

import {
  getResourceReviewPathname,
  resourceReviewAPI,
  ResourceReviewSchema,
  ResourceReviewListResponseSchema,
  ResourceReviewResponseSchema,
  refetchResourceReviews,
} from "@/services/resources";

export function useResourceReviews(resourceId?: number | null) {
  return useSWR<ResourceReviewListResponseSchema>(
    resourceId ? getResourceReviewPathname({ resourceId }) : null
  );
}

export function useResourceReview(
  resourceId?: number | null,
  reviewId?: number | null
) {
  return useSWR<ResourceReviewSchema>(
    resourceId && typeof reviewId === "number"
      ? getResourceReviewPathname({ resourceId, reviewId })
      : null
  );
}

type SWRMutationOptions<T = ResourceReviewResponseSchema> =
  SWRMutationConfiguration<T, Error, string | null>;

export const useCreateResourceReview = (
  resourceId: number,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => {
  return useSWRMutation(
    resourceId ? getResourceReviewPathname({ resourceId }) : null,
    resourceReviewAPI.create,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchResourceReviews();
      },
    }
  );
};

export const useUpdateResourceReview = (
  resourceId: number,
  reviewId: number,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => {
  return useSWRMutation(
    resourceId && reviewId
      ? getResourceReviewPathname({ resourceId, reviewId })
      : null,
    resourceReviewAPI.update,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchResourceReviews();
      },
    }
  );
};

export const useDeleteResourceReview = (
  resourceId: number,
  reviewId: number,
  { onSuccess, ...options }: SWRMutationOptions<void> = {}
) => {
  return useSWRMutation(
    resourceId && reviewId
      ? getResourceReviewPathname({ resourceId, reviewId })
      : null,
    resourceReviewAPI.delete,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchResourceReviews();
      },
    }
  );
};
