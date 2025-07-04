import useSWR from "swr";
import useSWRMutation, { SWRMutationConfiguration } from "swr/mutation";

import {
  getResourceReviewPathname,
  resourceReviewAPI,
  ResourceReviewListResponseSchema,
  ResourceReviewResponseSchema,
  refetchResourceReviews,
} from "@/services/resources";

export function useResourceReviewList(resourceId?: string | null) {
  return useSWR<ResourceReviewListResponseSchema>(
    resourceId ? getResourceReviewPathname({ resourceId }) : null
  );
}

export function useResourceReview(
  resourceId?: string | null,
  reviewId?: number | null
) {
  return useSWR<ResourceReviewResponseSchema>(
    resourceId && typeof reviewId === "number"
      ? getResourceReviewPathname({ resourceId, reviewId })
      : null
  );
}

type SWRMutationOptions<T = ResourceReviewResponseSchema> =
  SWRMutationConfiguration<T, Error, string | null>;

export const useCreateResourceReview = (
  resourceId: string | null,
  { onSuccess, ...options }: SWRMutationOptions = {}
) => {
  return useSWRMutation(
    resourceId ? getResourceReviewPathname({ resourceId }) : null,
    resourceReviewAPI.create,
    {
      ...options,
      onSuccess: (data, key, config) => {
        onSuccess?.(data, key, config);
        refetchResourceReviews(resourceId);
      },
    }
  );
};

export const useUpdateResourceReview = (
  resourceId: string | null,
  reviewId?: number | null,
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
        refetchResourceReviews(resourceId);
      },
    }
  );
};

export const useDeleteResourceReview = (
  resourceId: string,
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
        refetchResourceReviews(resourceId);
      },
    }
  );
};
