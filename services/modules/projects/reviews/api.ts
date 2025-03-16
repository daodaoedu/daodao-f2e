import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import {
  CreateProjectReviewSchema,
  ProjectReviewSchema,
  UpdateProjectReviewSchema,
} from './schema';

export type ProjectReviewSWRKey = string;

interface GetProjectReviewPathnameProps {
  projectId: string;
  reviewId?: number | null;
}

export const getProjectReviewPathname = ({
  projectId,
  reviewId,
}: GetProjectReviewPathnameProps) =>
  apiPaths.projects(projectId).reviews(reviewId).toString();

interface ProjectReviewAPIType {
  create: MutationFetcher<
    ProjectReviewSchema,
    ProjectReviewSWRKey,
    CreateProjectReviewSchema
  >;
  update: MutationFetcher<
    ProjectReviewSchema,
    ProjectReviewSWRKey,
    UpdateProjectReviewSchema
  >;
  delete: MutationFetcher<
    void,
    ProjectReviewSWRKey,
    Required<GetProjectReviewPathnameProps>
  >;
}

const projectReviewAPI: ProjectReviewAPIType = {
  create: (_, { arg: { projectId, ...arg } }) =>
    mutations.post<ProjectReviewSchema>(
      getProjectReviewPathname({ projectId }),
      arg
    ),

  update: (_, { arg: { projectId, id, ...arg } }) =>
    mutations.put<ProjectReviewSchema>(
      getProjectReviewPathname({ projectId, reviewId: id }),
      arg
    ),

  delete: (_, { arg }) => mutations.delete<void>(getProjectReviewPathname(arg)),
};

export default projectReviewAPI;
