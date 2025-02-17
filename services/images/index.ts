import { z } from 'zod';
import { mutations, RequestContentType } from '../httpClient';

export const imagesEndpoint = '/images';

const getImageEndpoint = (id?: string) =>
  id ? `${imagesEndpoint}/${id}` : imagesEndpoint;

const uploadImageSchema = z.object({
  file: z.instanceof(File),
});

export type UploadImageRequest = z.infer<typeof uploadImageSchema>;

export const uploadImage = (request: UploadImageRequest) => {
  return mutations.post<{ url: string }>(
    getImageEndpoint(),
    request,
    RequestContentType.FormData
  );
};

const deleteImageSchema = z.object({
  id: z.string(),
});

export type DeleteImageRequest = z.infer<typeof deleteImageSchema>;

export const deleteImage = (request: DeleteImageRequest) => {
  return mutations.delete(getImageEndpoint(request.id));
};
