import { z } from 'zod';
import { HttpError, mutations, RequestContentType } from '../core';

export const imagesEndpoint = '/images';

const getImageEndpoint = (id?: string) =>
  id ? `${imagesEndpoint}/${id}` : imagesEndpoint;

const uploadImageSchema = z.object({
  file: z.instanceof(File),
});

export type UploadImageRequest = z.infer<typeof uploadImageSchema>;

export const uploadImage = (request: UploadImageRequest) => {
  const imageType = /image.*/;
  const maxKB = 500;
  const maxSize = maxKB * 1024;

  if (!request.file.type.match(imageType)) {
    throw new HttpError(400, { message: '僅支援上傳圖片唷！' });
  }

  if (request.file.size > maxSize) {
    throw new HttpError(400, { message: `圖片最大限制 ${maxKB} KB` });
  }

  return mutations.post<{ url: string }>(
    getImageEndpoint(),
    request,
    RequestContentType.FormData
  );
};

export const updateImage = async (
  imgFiles?: File[] | null,
  imgUrls?: string[] | null
) => {
  if (Array.isArray(imgFiles) && imgFiles.length > 0) {
    const { url } = await uploadImage({ file: imgFiles[0] });
    return [url];
  }

  return imgUrls;
};

const deleteImageSchema = z.object({
  id: z.string(),
});

export type DeleteImageRequest = z.infer<typeof deleteImageSchema>;

export const deleteImage = (request: DeleteImageRequest) => {
  return mutations.delete(getImageEndpoint(request.id));
};
