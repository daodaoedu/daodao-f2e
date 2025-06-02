import { mutate } from "swr";
import { MutationFetcher } from "swr/mutation";
import { mutations, parseToString } from "@/services/core";

import { ProjectOutcomeSchema, ProjectOutcomeFormSchema } from "./schema";
import { uploadImages } from "../../images";
import { getProjectPathname } from "../core";

interface GetProjectOutcomePathnameProps {
  projectId: string;
  outcomeId?: number | null;
}

export const getProjectOutcomePathname = ({
  projectId,
  outcomeId,
}: GetProjectOutcomePathnameProps) => {
  const pathname = `/projects/${parseToString(projectId)}/outcomes`;

  if (outcomeId) {
    return `${pathname}/${parseToString(outcomeId)}`;
  }

  return pathname;
};

export const refetchProjectOutcome = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getProjectPathname());
  });
};

interface ProjectOutcomeAPIType {
  create: MutationFetcher<
    ProjectOutcomeSchema,
    string,
    ProjectOutcomeFormSchema
  >;
  update: MutationFetcher<
    ProjectOutcomeSchema,
    string,
    ProjectOutcomeFormSchema
  >;
  delete: MutationFetcher<void, string>;
}

export const projectOutcomeAPI: ProjectOutcomeAPIType = {
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
