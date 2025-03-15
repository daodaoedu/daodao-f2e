import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import {
  CreateProjectMilestoneSchema,
  ProjectMilestoneSchema,
  UpdateProjectMilestoneSchema,
} from './schema';

export type ProjectMilestoneSWRKey = string;

interface GetProjectMilestonePathnameProps {
  projectId: string;
  milestoneId?: number;
}

export const getProjectMilestonePathname = ({
  projectId,
  milestoneId,
}: GetProjectMilestonePathnameProps) =>
  apiPaths.projects(projectId).milestones(milestoneId).toString();

interface ProjectMilestoneAPIType {
  create: MutationFetcher<
    ProjectMilestoneSchema,
    ProjectMilestoneSWRKey,
    CreateProjectMilestoneSchema
  >;
  update: MutationFetcher<
    ProjectMilestoneSchema,
    ProjectMilestoneSWRKey,
    UpdateProjectMilestoneSchema
  >;
  delete: MutationFetcher<
    void,
    ProjectMilestoneSWRKey,
    Required<GetProjectMilestonePathnameProps>
  >;
}

const projectMilestoneAPI: ProjectMilestoneAPIType = {
  create: (_, { arg: { projectId, ...arg } }) =>
    mutations.post<ProjectMilestoneSchema>(
      getProjectMilestonePathname({ projectId }),
      arg
    ),

  update: (_, { arg: { projectId, id, ...arg } }) =>
    mutations.put<ProjectMilestoneSchema>(
      getProjectMilestonePathname({ projectId, milestoneId: id }),
      arg
    ),

  delete: (_, { arg }) =>
    mutations.delete<void>(getProjectMilestonePathname(arg)),
};

export default projectMilestoneAPI;
