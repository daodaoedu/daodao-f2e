import { CircleSchema } from "./schema";

export const formatCircleData = (data: CircleSchema) => {
  return {
    ...data,
    content: data.content ?? data.description ?? "",
  };
};
