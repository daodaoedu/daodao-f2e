import { MutationFetcher } from "swr/mutation";
import { mutations, parseToString } from "@/services/core";

import {
  ProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
} from "./schema";

export type ProjectSWRKey = string;

interface GetProjectPathnameProps {
  isMe?: boolean;
  id?: string;
}

export const getProjectPathname = ({
  id,
  isMe,
}: GetProjectPathnameProps = {}) => {
  const pathname = "/projects";

  if (id) {
    return `${pathname}/${parseToString(id)}`;
  }
  if (isMe) {
    return `${pathname}/me`;
  }

  return pathname;
};

interface ProjectAPIType {
  create: MutationFetcher<ProjectSchema, ProjectSWRKey, CreateProjectSchema>;
  update: MutationFetcher<ProjectSchema, ProjectSWRKey, UpdateProjectSchema>;
  delete: MutationFetcher<void, ProjectSWRKey, { id: string }>;
}

const projectAPI: ProjectAPIType = {
  create: (_, { arg }) =>
    mutations.post<ProjectSchema>(getProjectPathname(), arg),

  update: (_, { arg: { id, ...arg } }) =>
    mutations.put<ProjectSchema>(getProjectPathname({ id }), arg),

  delete: (_, { arg }) => mutations.delete<void>(getProjectPathname(arg)),
};

export default projectAPI;
