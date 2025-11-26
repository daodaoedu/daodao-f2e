import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/shared/lib/helper";
import { mutations, fetcher } from "@/shared/lib/http";

import {
  ProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectMutationResponseSchema,
} from "./schema";

export type ProjectSWRKey = string;

interface GetProjectPathnameProps {
  isMe?: boolean;
  id?: string;
  isPublic?: boolean;
}

export const getProjectPathname = ({
  id,
  isMe,
  isPublic,
}: GetProjectPathnameProps = {}) => {
  const pathname = "/api/v1/projects";

  if (id) {
    return `${pathname}/${parseToString(id)}`;
  }
  if (isMe) {
    return `${pathname}/me`;
  }
  if (isPublic) {
    return `${pathname}/public`;
  }

  return pathname;
};

// Helper to transform API response to match schema
const transformProject = (project: any): ProjectSchema => ({
  ...project,
  createdDate: project.createdAt || project.createdDate,
  updatedDate: project.updatedAt || project.updatedDate,
});

// API class for read operations
class ProjectAPIClass {
  async readPublicList(): Promise<ProjectSchema[]> {
    const response = await fetcher<{ success: boolean; data: any[] }>(
      getProjectPathname({ isPublic: true })
    );
    return response.data.map(transformProject);
  }

  async readMyList(): Promise<ProjectSchema[]> {
    const response = await fetcher<{ success: boolean; data: any[] }>(
      getProjectPathname({ isMe: true })
    );
    return response.data.map(transformProject);
  }

  async read(id: string): Promise<ProjectSchema> {
    const response = await fetcher<{ success: boolean; data: any }>(
      getProjectPathname({ id })
    );
    return transformProject(response.data);
  }
}

export const projectAPIClass = new ProjectAPIClass();

interface ProjectMutationAPIType {
  create: MutationFetcher<
    ProjectMutationResponseSchema,
    ProjectSWRKey,
    CreateProjectSchema
  >;
  update: MutationFetcher<
    ProjectMutationResponseSchema,
    ProjectSWRKey,
    UpdateProjectSchema
  >;
  delete: MutationFetcher<void, ProjectSWRKey, { id: string }>;
}

const projectAPI: ProjectMutationAPIType = {
  create: (_, { arg }) =>
    mutations.post<ProjectMutationResponseSchema>(getProjectPathname(), arg),

  update: (_, { arg: { id, ...arg } }) =>
    mutations.put<ProjectMutationResponseSchema>(
      getProjectPathname({ id }),
      arg
    ),

  delete: (_, { arg }) => mutations.delete<void>(getProjectPathname(arg)),
};

export default projectAPI;
