import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { IdeaSchema } from '@/services/modules/ideas';
import type { IdeaFilters, IdeaTag } from '../types';
import { updateIdea as updateIdeaFields } from './updateReducer';

// Context State Interface
interface IdeasContextState {
  filters: IdeaFilters;

  // UI State
  isSearchExpanded: boolean;
  selectedTags: IdeaTag[];
  availableTags: IdeaTag[];

  // Modal States
  showCreateModal: boolean;
  showDeleteModal: boolean;
  editingIdeaId: string | null;

  // View Mode
  viewMode: 'list' | 'grid';

  // Local Ideas Data
  localIdeas: IdeaSchema[];

  // Loading states
  isUpdatingIdea: boolean;
  isDeletingIdea: boolean;
}

// Define a type for counter fields
type IdeaCountField = keyof Pick<IdeaSchema, 'viewCount' | 'likeCount' | 'commentCount'>;

// Define a type for idea updates
type IdeaUpdates = Partial<{
  [K in keyof IdeaSchema]: K extends IdeaCountField ? number : IdeaSchema[K];
}>;

// Action Types
type IdeasAction =
  | { type: 'SET_FILTERS'; payload: Partial<IdeaFilters> }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_TAG'; payload: IdeaTag }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'CLEAR_TAGS' }
  | { type: 'SET_AVAILABLE_TAGS'; payload: IdeaTag[] }
  | { type: 'TOGGLE_SEARCH_EXPANDED' }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' }
  | { type: 'SHOW_CREATE_MODAL' }
  | { type: 'HIDE_CREATE_MODAL' }
  | { type: 'SHOW_DELETE_MODAL'; payload: string }
  | { type: 'HIDE_DELETE_MODAL' }
  | { type: 'SET_EDITING_IDEA'; payload: string | null }
  | { type: 'RESET_UI_STATE' }
  | { type: 'ADD_LOCAL_IDEA'; payload: IdeaSchema }
  | { type: 'UPDATE_LOCAL_IDEA'; payload: IdeaUpdates & { id: string } }
  | { type: 'DELETE_LOCAL_IDEA'; payload: string }
  | { type: 'SET_LOCAL_IDEAS'; payload: IdeaSchema[] }
  | { type: 'BULK_UPDATE_LOCAL_IDEAS'; payload: { ids: string[]; updates: Partial<IdeaSchema> } }
  | { type: 'SET_UPDATING_IDEA'; payload: boolean }
  | { type: 'SET_DELETING_IDEA'; payload: boolean };

// Context Interface
interface IdeasContextValue {
  state: IdeasContextState;
  dispatch: React.Dispatch<IdeasAction>;

  // Convenience methods
  setFilters: (filters: Partial<IdeaFilters>) => void;
  setSearch: (search: string) => void;
  addTag: (tag: IdeaTag) => void;
  removeTag: (tagId: string) => void;
  clearTags: () => void;
  toggleSearchExpanded: () => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  showCreateModal: () => void;
  hideCreateModal: () => void;
  showDeleteModal: (ideaId: string) => void;
  hideDeleteModal: () => void;
  setEditingIdea: (ideaId: string | null) => void;
  resetUIState: () => void;

  // Local Ideas Management (Phase 2: 統一管理)
  addLocalIdea: (idea: IdeaSchema) => void;
  updateLocalIdea: (updates: IdeaUpdates & { id: string }) => void;
  deleteLocalIdea: (ideaId: string) => void;
  setLocalIdeas: (ideas: IdeaSchema[]) => void;
  bulkUpdateLocalIdeas: (ids: string[], updates: Partial<IdeaSchema>) => void;

  // Loading state management
  setUpdatingIdea: (isUpdating: boolean) => void;
  setDeletingIdea: (isDeleting: boolean) => void;
}

// Default tags based on learn.jsx
const defaultAvailableTags: IdeaTag[] = [
  { id: '1', name: 'UX設計', category: 'design', count: 234 },
  { id: '2', name: '程式設計', category: 'tech', count: 456 },
  { id: '3', name: '資料科學', category: 'tech', count: 189 },
  { id: '4', name: '產品管理', category: 'business', count: 167 },
  { id: '5', name: '心理學', category: 'psychology', count: 123 },
  { id: '6', name: '行為科學', category: 'psychology', count: 98 },
  { id: '7', name: '學習科學', category: 'education', count: 87 },
  { id: '8', name: '創新思維', category: 'creativity', count: 145 },
];

// Initial State
const initialState: IdeasContextState = {
  filters: {
    search: '',
    selectedTags: [],
    visibility: 'public',
    sortBy: 'createdDate',
    sortOrder: 'desc',
  },
  isSearchExpanded: false,
  selectedTags: [],
  availableTags: defaultAvailableTags,
  showCreateModal: false,
  showDeleteModal: false,
  editingIdeaId: null,
  viewMode: 'list',
  localIdeas: [],
  isUpdatingIdea: false,
  isDeletingIdea: false,
};

// Reducer
const ideasReducer = (state: IdeasContextState, action: IdeasAction): IdeasContextState => {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SEARCH':
      return {
        ...state,
        filters: { ...state.filters, search: action.payload },
      };

    case 'ADD_TAG':
      if (state.selectedTags.find((tag) => tag.id === action.payload.id)) {
        return state; // Tag already exists
      }
      if (state.selectedTags.length >= 3) {
        return state; // Max 3 tags
      }
      return {
        ...state,
        selectedTags: [...state.selectedTags, action.payload],
        filters: {
          ...state.filters,
          selectedTags: [...state.filters.selectedTags, action.payload.name],
        },
      };

    case 'REMOVE_TAG': {
      const filteredTags = state.selectedTags.filter((tag) => tag.id !== action.payload);
      return {
        ...state,
        selectedTags: filteredTags,
        filters: {
          ...state.filters,
          selectedTags: filteredTags.map((tag) => tag.name),
        },
      };
    }

    case 'CLEAR_TAGS':
      return {
        ...state,
        selectedTags: [],
        filters: { ...state.filters, selectedTags: [] },
      };

    case 'SET_AVAILABLE_TAGS':
      return {
        ...state,
        availableTags: action.payload,
      };

    case 'TOGGLE_SEARCH_EXPANDED':
      return {
        ...state,
        isSearchExpanded: !state.isSearchExpanded,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SHOW_CREATE_MODAL':
      return {
        ...state,
        showCreateModal: true,
        editingIdeaId: null,
      };

    case 'HIDE_CREATE_MODAL':
      return {
        ...state,
        showCreateModal: false,
        editingIdeaId: null,
      };

    case 'SHOW_DELETE_MODAL':
      return {
        ...state,
        showDeleteModal: true,
        editingIdeaId: action.payload,
      };

    case 'HIDE_DELETE_MODAL':
      return {
        ...state,
        showDeleteModal: false,
        editingIdeaId: null,
      };

    case 'SET_EDITING_IDEA':
      return {
        ...state,
        editingIdeaId: action.payload,
      };

    case 'RESET_UI_STATE':
      return {
        ...initialState,
        availableTags: state.availableTags, // Keep available tags
        localIdeas: state.localIdeas, // Keep local ideas
      };

    case 'ADD_LOCAL_IDEA':
      return {
        ...state,
        localIdeas: [action.payload, ...state.localIdeas],
      };

    case 'UPDATE_LOCAL_IDEA': {
      return {
        ...state,
        localIdeas: state.localIdeas.map((idea) =>
          idea.id === action.payload.id ? updateIdeaFields(idea, action.payload) : idea
        ),
      };
    }

    case 'DELETE_LOCAL_IDEA':
      return {
        ...state,
        localIdeas: state.localIdeas.filter((idea) => idea.id !== action.payload),
      };

    case 'SET_LOCAL_IDEAS':
      return {
        ...state,
        localIdeas: action.payload,
      };

    case 'BULK_UPDATE_LOCAL_IDEAS':
      return {
        ...state,
        localIdeas: state.localIdeas.map((idea) => {
          if (action.payload.ids.includes(idea.id)) {
            return { ...idea, ...action.payload.updates };
          }
          return idea;
        }),
      };

    case 'SET_UPDATING_IDEA':
      return {
        ...state,
        isUpdatingIdea: action.payload,
      };

    case 'SET_DELETING_IDEA':
      return {
        ...state,
        isDeletingIdea: action.payload,
      };

    default:
      return state;
  }
};

// Create Context
const IdeasContext = createContext<IdeasContextValue | undefined>(undefined);

// Provider Component
interface IdeasProviderProps {
  children: ReactNode;
}

export const IdeasProvider: React.FC<IdeasProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ideasReducer, initialState);

  // Convenience methods
  const setFilters = (filters: Partial<IdeaFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSearch = (search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  };

  const addTag = (tag: IdeaTag) => {
    dispatch({ type: 'ADD_TAG', payload: tag });
  };

  const removeTag = (tagId: string) => {
    dispatch({ type: 'REMOVE_TAG', payload: tagId });
  };

  const clearTags = () => {
    dispatch({ type: 'CLEAR_TAGS' });
  };

  const toggleSearchExpanded = () => {
    dispatch({ type: 'TOGGLE_SEARCH_EXPANDED' });
  };

  const setViewMode = (mode: 'list' | 'grid') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  const showCreateModal = () => {
    dispatch({ type: 'SHOW_CREATE_MODAL' });
  };

  const hideCreateModal = () => {
    dispatch({ type: 'HIDE_CREATE_MODAL' });
  };

  const showDeleteModal = (ideaId: string) => {
    dispatch({ type: 'SHOW_DELETE_MODAL', payload: ideaId });
  };

  const hideDeleteModal = () => {
    dispatch({ type: 'HIDE_DELETE_MODAL' });
  };

  const setEditingIdea = (ideaId: string | null) => {
    dispatch({ type: 'SET_EDITING_IDEA', payload: ideaId });
  };

  const resetUIState = () => {
    dispatch({ type: 'RESET_UI_STATE' });
  };

  const addLocalIdea = (idea: IdeaSchema) => {
    dispatch({ type: 'ADD_LOCAL_IDEA', payload: idea });
  };

  const updateLocalIdea = (updates: IdeaUpdates & { id: string }) => {
    dispatch({ type: 'UPDATE_LOCAL_IDEA', payload: updates });
  };

  const deleteLocalIdea = (ideaId: string) => {
    dispatch({ type: 'DELETE_LOCAL_IDEA', payload: ideaId });
  };

  const setLocalIdeas = (ideas: IdeaSchema[]) => {
    dispatch({ type: 'SET_LOCAL_IDEAS', payload: ideas });
  };

  const bulkUpdateLocalIdeas = (ids: string[], updates: Partial<IdeaSchema>) => {
    dispatch({ type: 'BULK_UPDATE_LOCAL_IDEAS', payload: { ids, updates } });
  };

  const setUpdatingIdea = (isUpdating: boolean) => {
    dispatch({ type: 'SET_UPDATING_IDEA', payload: isUpdating });
  };

  const setDeletingIdea = (isDeleting: boolean) => {
    dispatch({ type: 'SET_DELETING_IDEA', payload: isDeleting });
  };

  const value: IdeasContextValue = {
    state,
    dispatch,
    setFilters,
    setSearch,
    addTag,
    removeTag,
    clearTags,
    toggleSearchExpanded,
    setViewMode,
    showCreateModal,
    hideCreateModal,
    showDeleteModal,
    hideDeleteModal,
    setEditingIdea,
    resetUIState,
    addLocalIdea,
    updateLocalIdea,
    deleteLocalIdea,
    setLocalIdeas,
    bulkUpdateLocalIdeas,
    setUpdatingIdea,
    setDeletingIdea,
  };

  return (
    <IdeasContext.Provider value={value}>
      {children}
    </IdeasContext.Provider>
  );
};

// Hook to use the context
export const useIdeasContext = (): IdeasContextValue => {
  const context = useContext(IdeasContext);
  if (!context) {
    throw new Error('useIdeasContext must be used within an IdeasProvider');
  }
  return context;
};

export default IdeasContext;
