// Re-export from services for convenience
export type {
  IdeaSchema,
  CreateIdeaFormSchema,
  UpdateIdeaFormSchema,
  DeleteIdeaSchema,
  IdeaResourceSchema,
  IdeaSearchParamsSchema,
  IdeaListResponseSchema,
} from '@/services/ideas';

// Feature-specific types for UI components
export interface IdeaFilters {
  search: string;
  selectedTags: string[];
  sortBy: 'createdDate' | 'updatedDate' | 'likeCount' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface IdeaTag {
  id: string;
  name: string;
  category: 'design' | 'tech' | 'business' | 'psychology' | 'education' | 'creativity' | 'custom';
  count?: number;
}

// Future feature: Comments system
export interface IdeaComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role?: string;
  };
  createdDate: string;
}
