import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/shared/lib/helper";
import { mutations } from "@/shared/lib/http";

import { ProjectReviewFormSchema, ProjectReviewSchema } from "./schema";
import { getProjectPathname } from "../core";

interface GetProjectReviewPathnameProps {
  projectId: string;
  reviewId?: number | null;
}

export const getProjectReviewPathname = ({
  projectId,
  reviewId,
}: GetProjectReviewPathnameProps) => {
  const pathname = `/projects/${parseToString(projectId)}/reviews`;

  if (reviewId) {
    return `${pathname}/${parseToString(reviewId)}`;
  }

  return pathname;
};

export const refetchProjectReview = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getProjectPathname());
  });
};

interface ProjectReviewAPIType {
  create: MutationFetcher<ProjectReviewSchema, string, ProjectReviewFormSchema>;
  update: MutationFetcher<ProjectReviewSchema, string, ProjectReviewFormSchema>;
  delete: MutationFetcher<void, string>;
}

export const projectReviewAPI: ProjectReviewAPIType = {
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
