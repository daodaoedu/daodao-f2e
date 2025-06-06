import type { IdeaSchema } from '@/services/modules/ideas/schema';

// Re-export from services for convenience
export type {
  IdeaSchema,
  CreateIdeaSchema,
  UpdateIdeaSchema,
  DeleteIdeaSchema,
  IdeaResourceSchema,
  IdeaQuerySchema,
  IdeaListResponseSchema,
} from '@/services/modules/ideas/schema';

// Feature-specific types for UI components
export interface IdeaFormState {
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export interface IdeaListState {
  ideas: IdeaSchema[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
}

export interface IdeaFilters {
  search: string;
  selectedTags: string[];
  visibility: 'public' | 'private' | 'all';
  sortBy: 'createdDate' | 'updatedDate' | 'likeCount' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface IdeaTag {
  id: string;
  name: string;
  category: 'design' | 'tech' | 'business' | 'psychology' | 'education' | 'creativity' | 'custom';
  count?: number;
}

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

export interface IdeaDetailState {
  idea: IdeaSchema | null;
  comments: IdeaComment[];
  isLoading: boolean;
  error: string | null;
  showComments: boolean;
}

// Form validation states
export interface IdeaFormValidation {
  title: {
    isValid: boolean;
    error?: string;
  };
  content: {
    isValid: boolean;
    error?: string;
  };
  resources: {
    isValid: boolean;
    errors?: Record<number, string>;
  };
}

// UI interaction states
export interface IdeaUIState {
  isAddingResource: boolean;
  editingResourceId: number | null;
  showTagSuggestions: boolean;
  selectedImageIndex: number;
  showPreviewModal: boolean;
}
