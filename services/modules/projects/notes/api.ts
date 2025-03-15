import { MutationFetcher } from 'swr/mutation';
import { apiPaths, mutations } from '@/services/core';

import {
  CreateProjectNoteSchema,
  ProjectNoteSchema,
  UpdateProjectNoteSchema,
} from './schema';

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
  create: (_, { arg: { projectId, ...arg } }) =>
    mutations.post<ProjectNoteSchema>(
      getProjectNotePathname({ projectId }),
      arg
    ),

  update: (_, { arg: { projectId, id, ...arg } }) =>
    mutations.put<ProjectNoteSchema>(
      getProjectNotePathname({ projectId, noteId: id }),
      arg
    ),

  delete: (_, { arg }) =>
    mutations.delete<void>(getProjectNotePathname(arg)),
};

export default projectNoteAPI;
