import { ZodError } from 'zod';
import {
  HttpError,
  mutations,
  RequestContentType,
  apiPaths,
} from '@/services/core';

import { uploadImagesSchema, UploadImagesSchema } from './schema';

const getImageEndpoint = (id?: string) => apiPaths.images(id).toString();

interface ImageType {
  url: string;
}

interface UploadImageResponse {
  data: ImageType[];
}

interface ImageAPIType {
  upload: (source: UploadImagesSchema) => Promise<UploadImageResponse>;
  delete: (id: string) => Promise<void>;
}

export const imageAPI: ImageAPIType = {
  upload: (source) => {
    try {
      const request = uploadImagesSchema.parse(source);

      return mutations.post(
        getImageEndpoint('multiple'),
        request,
        RequestContentType.FormData
      );
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        throw new HttpError(400, { message: error.issues[0].message });
      }
      throw new HttpError(400, {
        message: '圖片上傳失敗，請稍後再試！',
      });
    }
  },
  delete: (id) => mutations.delete(getImageEndpoint(id)),
};

export const uploadImages = async (
  files?: File[] | null,
  urls?: string[] | null
) => {
  if (Array.isArray(files) && files.length > 0) {
    const { data } = await imageAPI.upload({ files });
    return [...(urls ?? []), ...data.map(({ url }) => url)];
  }

  return urls;
};
