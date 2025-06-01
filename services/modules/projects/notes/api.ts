import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { mutations, parseToString } from "@/services/core";

import { ProjectNoteSchema, ProjectNoteFormSchema } from "./schema";
import { uploadImages } from "../../images";
import { getProjectPathname } from "../core";

export type ProjectNoteSWRKey = string;

interface GetProjectNotePathnameProps {
  projectId: string;
  noteId?: number | null;
}

export const getProjectNotePathname = ({
  projectId,
  noteId,
}: GetProjectNotePathnameProps) => {
  const pathname = `/projects/${parseToString(projectId)}/notes`;

  if (noteId) {
    return `${pathname}/${parseToString(noteId)}`;
  }

  return pathname;
};

export const refetchProjectNote = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getProjectPathname());
  });
};

interface ProjectNoteAPIType {
  create: MutationFetcher<ProjectNoteSchema, string, ProjectNoteFormSchema>;
  update: MutationFetcher<ProjectNoteSchema, string, ProjectNoteFormSchema>;
  delete: MutationFetcher<void, string>;
}

export const projectNoteAPI: ProjectNoteAPIType = {
  create: async (url, { arg: { imgFiles, imgUrls, ...arg } }) => {
    const updatedImgUrls = await uploadImages(imgFiles, imgUrls);

    return mutations.post(url, {
      ...arg,
      imgUrls: updatedImgUrls,
    });
  },

  update: async (url, { arg: { imgFiles, imgUrls, ...arg } }) => {
    const updatedImgUrls = await uploadImages(imgFiles, imgUrls);

    return mutations.put(url, {
      ...arg,
      imgUrls: updatedImgUrls,
    });
  },

  delete: mutations.delete,
};
