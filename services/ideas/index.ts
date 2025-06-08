import { z } from "zod";
import { mutations } from "@/utils/http";
import { uploadImages } from "../images";

const ideaEndpoint = "/ideas";

function removeNumberSuffixStrict(id: string): string | null {
  if (!id || typeof id !== "string") {
    return null;
  }

  // 使用正則表達式檢查是否以 -數字 結尾
  const match = id.match(/_\d+$/);
  if (!match) {
    return id; // 如果沒有匹配到 -數字 結尾，返回原字符串
  }

  // 移除匹配到的部分
  return id.substring(0, id.length - match[0].length);
}

interface GetIdeaKeyOptions {
  ideaId?: string;
}

export const getIdeaEndpoint = ({ ideaId }: GetIdeaKeyOptions = {}) => {
  if (ideaId) {
    return `${ideaEndpoint}/${removeNumberSuffixStrict(ideaId)}`;
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
        id: z.number(),
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
  const updatedImageUrls = await uploadImages(imageFiles, imageUrls);
  // 若有影片檔案，處理影片上傳；否則保留原 video_urls
  const updatedVideoUrls = videoFiles
    ? await uploadImages(videoFiles, videoUrls)
    : videoUrls;

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
  const updatedImageUrls = await uploadImages(imageFiles, imageUrls);
  const updatedVideoUrls = videoFiles
    ? await uploadImages(videoFiles, videoUrls)
    : videoUrls;

  return mutations.put(getIdeaEndpoint({ ideaId: id }), {
    ...idea,
    imageUrls: updatedImageUrls,
    videoUrls: updatedVideoUrls,
  });
};

export const deleteIdea = (ideaId: string) => {
  return mutations.delete(getIdeaEndpoint({ ideaId }));
};
