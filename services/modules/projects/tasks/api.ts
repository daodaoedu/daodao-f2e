import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import {
  CreateProjectTaskSchema,
  ProjectTaskSchema,
  UpdateProjectTaskSchema,
} from './schema';

export type ProjectTaskSWRKey = string;

interface GetProjectTaskPathnameProps {
  projectId: string;
  milestoneId: number;
  taskId?: number;
}

export const getProjectTaskPathname = ({
  projectId,
  milestoneId,
  taskId,
}: GetProjectTaskPathnameProps) =>
  apiPaths.projects(projectId).milestones(milestoneId).tasks(taskId).toString();

interface ProjectTaskAPIType {
  create: MutationFetcher<
    ProjectTaskSchema,
    ProjectTaskSWRKey,
    CreateProjectTaskSchema
  >;
  update: MutationFetcher<
    ProjectTaskSchema,
    ProjectTaskSWRKey,
    UpdateProjectTaskSchema
  >;
  delete: MutationFetcher<
    void,
    ProjectTaskSWRKey,
    Required<GetProjectTaskPathnameProps>
  >;
}

const projectTaskAPI: ProjectTaskAPIType = {
  create: (_, { arg: { projectId, milestoneId, ...arg } }) =>
    mutations.post<ProjectTaskSchema>(
      getProjectTaskPathname({ projectId, milestoneId }),
      arg
    ),

  update: (_, { arg: { projectId, milestoneId, id, ...arg } }) =>
    mutations.put<ProjectTaskSchema>(
      getProjectTaskPathname({ projectId, milestoneId, taskId: id }),
      arg
    ),

  delete: (_, { arg }) => mutations.delete<void>(getProjectTaskPathname(arg)),
};

export default projectTaskAPI;
