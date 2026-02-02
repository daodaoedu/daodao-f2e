import useSWR from "swr";
import useSWRMutation, { type SWRMutationConfiguration } from "swr/mutation";

import {
  getResourceReviewPathname,
  type ResourceReviewListResponseSchema,
  type ResourceReviewResponseSchema,
  resourceReviewAPI,
} from "@/services/resources";

export function useResourceReviewList(resourceId?: string | null) {
  return useSWR<ResourceReviewListResponseSchema>(
    resourceId ? getResourceReviewPathname({ resourceId }) : null
  );
}

export function useResourceReview(resourceId?: string | null, reviewId?: number | null) {
  return useSWR<ResourceReviewResponseSchema>(
    resourceId && typeof reviewId === "number"
      ? getResourceReviewPathname({ resourceId, reviewId })
      : null
  );
}

type SWRMutationOptions<T = ResourceReviewResponseSchema> = SWRMutationConfiguration<
  T,
  Error,
  string | null
>;

export const useCreateResourceReview = (
  resourceId: string | null,
  { onSuccess, ...options }: SWRMutationOptions = {}
) =>
  useSWRMutation(
    resourceId ? getResourceReviewPathname({ resourceId }) : null,
    resourceReviewAPI.create,
    {
      ...options,
      onSuccess,
    }
  );

export const useUpdateResourceReview = (
  resourceId: string | null,
  reviewId?: number | null,
  { onSuccess, ...options }: SWRMutationOptions = {}
) =>
  useSWRMutation(
    resourceId && reviewId ? getResourceReviewPathname({ resourceId, reviewId }) : null,
    resourceReviewAPI.update,
    {
      ...options,
      onSuccess,
    }
  );

export const useDeleteResourceReview = (
  resourceId: string,
  reviewId: number,
  { onSuccess, ...options }: SWRMutationOptions<void> = {}
) =>
  useSWRMutation(
    resourceId && reviewId ? getResourceReviewPathname({ resourceId, reviewId }) : null,
    resourceReviewAPI.delete,
    {
      ...options,
      onSuccess,
    }
  );
