import { z } from 'zod';
import { mutations } from '../httpClient';
import { updateImage } from '../images';

const ideaEndpoint = '/ideas';

interface GetIdeaKeyOptions {
  ideaId?: string;
}

export const getIdeaEndpoint = ({ ideaId }: GetIdeaKeyOptions = {}) => {
  if (ideaId) {
    return `${ideaEndpoint}/${ideaId}`;
  }
  return ideaEndpoint;
};

const ideaSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrls: z.array(z.string()).nullable(),
  imageFiles: z.array(z.instanceof(File)).nullable().optional(),
  videoUrls: z.array(z.string()).nullable().optional(),
  videoFiles: z.array(z.instanceof(File)).nullable().optional(),
  visibility: z.string(),
  ideaResources: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .nullable()
    .optional(),
});

export type IdeaSchema = z.infer<typeof ideaSchema>;

// 建立 Idea 時移除 id 欄位
export const createIdeaSchema = ideaSchema.omit({ id: true });
export type CreateIdeaRequest = z.infer<typeof createIdeaSchema>;

export const createIdea = async ({
  imageFiles,
  imageUrls,
  videoFiles,
  videoUrls,
  ...idea
}: CreateIdeaRequest) => {
  // 處理圖片上傳
  const updatedImageUrls = await updateImage(imageFiles, imageUrls);
  // 若有影片檔案，處理影片上傳；否則保留原 video_urls
  const updatedVideoUrls = videoFiles ? await updateImage(videoFiles, videoUrls) : videoUrls;

  return mutations.post(getIdeaEndpoint(), {
    ...idea,
    imageUrls: updatedImageUrls,
    videoUrls: updatedVideoUrls,
  });
};

export const updateIdeaSchema = ideaSchema;
export type UpdateIdeaRequest = z.infer<typeof updateIdeaSchema>;

export const updateIdea = async ({
  id,
  imageFiles,
  imageUrls,
  videoFiles,
  videoUrls,
  ...idea
}: UpdateIdeaRequest) => {
  const updatedImageUrls = await updateImage(imageFiles, imageUrls);
  const updatedVideoUrls = videoFiles ? await updateImage(videoFiles, videoUrls) : videoUrls;

  return mutations.put(getIdeaEndpoint({ ideaId: id }), {
    ...idea,
    imageUrls: updatedImageUrls,
    videoUrls: updatedVideoUrls,
  });
};

export const deleteIdea = (ideaId: string) => {
  return mutations.delete(getIdeaEndpoint({ ideaId }));
};