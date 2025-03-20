import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import {
  CreateProjectNoteSchema,
  ProjectNoteSchema,
  UpdateProjectNoteSchema,
} from './schema';
import { uploadImages } from '../../images';

export type ProjectNoteSWRKey = string;

interface GetProjectNotePathnameProps {
  projectId: string;
  noteId?: number | null;
}

export const getProjectNotePathname = ({
  projectId,
  noteId,
}: GetProjectNotePathnameProps) =>
  apiPaths.projects(projectId).notes(noteId).toString();

interface ProjectNoteAPIType {
  create: MutationFetcher<
    ProjectNoteSchema,
    ProjectNoteSWRKey,
    CreateProjectNoteSchema
  >;
  update: MutationFetcher<
    ProjectNoteSchema,
    ProjectNoteSWRKey,
    UpdateProjectNoteSchema
  >;
  delete: MutationFetcher<
    void,
    ProjectNoteSWRKey,
    Required<GetProjectNotePathnameProps>
  >;
}

const projectNoteAPI: ProjectNoteAPIType = {
  create: async (_, { arg: { projectId, imgFiles, imgUrls, ...arg } }) => {
    const updatedImgUrls = await uploadImages(imgFiles, imgUrls);

    return mutations.post<ProjectNoteSchema>(
      getProjectNotePathname({ projectId }),
      { ...arg, imgUrls: updatedImgUrls }
    );
  },

  update: async (_, { arg: { projectId, id, imgFiles, imgUrls, ...arg } }) => {
    const updatedImgUrls = await uploadImages(imgFiles, imgUrls);

    return mutations.put<ProjectNoteSchema>(
      getProjectNotePathname({ projectId, noteId: id }),
      { ...arg, imgUrls: updatedImgUrls }
    );
  },

  delete: (_, { arg }) => mutations.delete<void>(getProjectNotePathname(arg)),
};

export default projectNoteAPI;
