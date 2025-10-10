import { MutationFetcher } from "swr/mutation";
import { parseToString } from "@/utils/helper";
import { mutations, fetcher } from "@/utils/http";

import {
  ProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
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

// API class for fetching projects
class ProjectAPI {
  // Helper to transform API response to match schema
  private transformProject(project: any): ProjectSchema {
    return {
      ...project,
      createdDate: project.createdAt || project.createdDate,
      updatedDate: project.updatedAt || project.updatedDate,
    };
  }

  /**
   * 取得公開的學習計劃列表
   */
  async readPublicList(): Promise<ProjectSchema[]> {
    const response = await fetcher<{ success: boolean; data: any[] }>(
      getProjectPathname({ isPublic: true })
    );
    return response.data.map((project) => this.transformProject(project));
  }

  /**
   * 取得我的學習計劃列表
   */
  async readMyList(): Promise<ProjectSchema[]> {
    const response = await fetcher<{ success: boolean; data: any[] }>(
      getProjectPathname({ isMe: true })
    );
    return response.data.map((project) => this.transformProject(project));
  }

  /**
   * 取得單個學習計劃
   */
  async read(id: string): Promise<ProjectSchema> {
    const response = await fetcher<{ success: boolean; data: any }>(
      getProjectPathname({ id })
    );
    return this.transformProject(response.data);
  }
}

export const projectAPIClass = new ProjectAPI();

interface ProjectMutationAPIType {
  create: MutationFetcher<ProjectSchema, ProjectSWRKey, CreateProjectSchema>;
  update: MutationFetcher<ProjectSchema, ProjectSWRKey, UpdateProjectSchema>;
  delete: MutationFetcher<void, ProjectSWRKey, { id: string }>;
}

const projectAPI: ProjectMutationAPIType = {
  create: (_, { arg }) =>
    mutations.post<ProjectSchema>(getProjectPathname(), arg),

  update: (_, { arg: { id, ...arg } }) =>
    mutations.put<ProjectSchema>(getProjectPathname({ id }), arg),

  delete: (_, { arg }) => mutations.delete<void>(getProjectPathname(arg)),
};

export default projectAPI;
