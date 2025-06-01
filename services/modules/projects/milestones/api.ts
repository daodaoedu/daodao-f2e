import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { mutations, parseToString } from "@/services/core";

import { ProjectMilestoneSchema, ProjectMilestoneFormSchema } from "./schema";
import { getProjectPathname } from "../core";

interface GetProjectMilestonePathnameProps {
  projectId: string;
  milestoneId?: number;
}

export const getProjectMilestonePathname = ({
  projectId,
  milestoneId,
}: GetProjectMilestonePathnameProps) => {
  const pathname = `/projects/${parseToString(projectId)}/milestones`;

  if (milestoneId) {
    return `${pathname}/${parseToString(milestoneId)}`;
  }

  return pathname;
};

export const refetchProjectMilestone = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getProjectPathname());
  });
};

interface ProjectMilestoneAPIType {
  create: MutationFetcher<
    ProjectMilestoneSchema,
    string,
    ProjectMilestoneFormSchema
  >;
  update: MutationFetcher<
    ProjectMilestoneSchema,
    string,
    ProjectMilestoneFormSchema
  >;
  delete: MutationFetcher<void, string>;
}

export const projectMilestoneAPI: ProjectMilestoneAPIType = {
  create: mutations.post,
  update: mutations.put,
  delete: mutations.delete,
};
