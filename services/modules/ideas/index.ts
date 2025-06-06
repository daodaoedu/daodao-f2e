// 新的模組化匯出
export * from './schema';
export { default as ideaAPI } from './api';
export { getIdeaPathname, buildIdeaQueryString } from './api';
export type { IdeaSWRKey } from './api';

// 向後相容匯出 - 支援舊的 hooks 和 services
export { 
  getIdeaEndpoint,
  createIdea,
  updateIdea,
  deleteIdea 
} from './api';

// 向後相容的類型匯出
export type {
  IdeaSchema,
  CreateIdeaSchema as CreateIdeaRequest,
  UpdateIdeaSchema as UpdateIdeaRequest,
  DeleteIdeaSchema,
  IdeaQuerySchema,
  IdeaListResponseSchema
} from './schema';
