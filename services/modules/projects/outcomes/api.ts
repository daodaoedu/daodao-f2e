import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import {
  CreateProjectOutcomeSchema,
  ProjectOutcomeSchema,
  UpdateProjectOutcomeSchema,
} from './schema';
import { uploadImages } from '../../images';

export type ProjectOutcomeSWRKey = string;

interface GetProjectOutcomePathnameProps {
  projectId: string;
  outcomeId?: number | null;
}

export const getProjectOutcomePathname = ({
  projectId,
  outcomeId,
}: GetProjectOutcomePathnameProps) =>
  apiPaths.projects(projectId).outcomes(outcomeId).toString();

interface ProjectOutcomeAPIType {
  create: MutationFetcher<
    ProjectOutcomeSchema,
    ProjectOutcomeSWRKey,
    CreateProjectOutcomeSchema
  >;
  update: MutationFetcher<
    ProjectOutcomeSchema,
    ProjectOutcomeSWRKey,
    UpdateProjectOutcomeSchema
  >;
  delete: MutationFetcher<
    void,
    ProjectOutcomeSWRKey,
    Required<GetProjectOutcomePathnameProps>
  >;
}

const projectOutcomeAPI: ProjectOutcomeAPIType = {
  create: async (_, { arg: { projectId, imgFiles, imgUrls, ...arg } }) => {
    const updatedImgUrls = await uploadImages(imgFiles, imgUrls);

    return mutations.post<ProjectOutcomeSchema>(
      getProjectOutcomePathname({ projectId }),
      { ...arg, imgUrls: updatedImgUrls }
    );
  },

  update: async (_, { arg: { projectId, id, imgFiles, imgUrls, ...arg } }) => {
    const updatedImgUrls = await uploadImages(imgFiles, imgUrls);

    return mutations.put<ProjectOutcomeSchema>(
      getProjectOutcomePathname({ projectId, outcomeId: id }),
      { ...arg, imgUrls: updatedImgUrls }
    );
  },

  delete: (_, { arg }) => mutations.delete<void>(getProjectOutcomePathname(arg)),
};

export default projectOutcomeAPI;
