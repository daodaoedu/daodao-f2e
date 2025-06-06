import React from 'react';
import { Paper } from '@/components/atoms/paper';
import { Container } from '@/components/atoms/container';
import type { CreateIdeaSchema } from '@/services/modules/ideas';
import Banner from './Banner';
import SearchField from './SearchField';
import SelectedCategory from './SelectedCategory';
import IdeaList from './IdeaList';
import IdeaForm from './IdeaForm';

interface IdeasViewProps {
  // UI State
  showCreateModal: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Handlers
  onCreateClick: () => void;
  onCloseModal: () => void;
  onSubmitIdea: (data: CreateIdeaSchema) => Promise<void>;
  onClearError: () => void;

  // Optional props
  className?: string;
}

/**
 * 純展示組件 - Ideas 頁面的 UI 結構
 * 不包含業務邏輯，僅負責渲染和事件傳遞
 */
const IdeasView: React.FC<IdeasViewProps> = ({
  showCreateModal,
  isSubmitting,
  error,
  onCreateClick,
  onCloseModal,
  onSubmitIdea,
  onClearError,
  className = '',
}) => {
  return (
    <div className={`bg-primary-palest min-h-screen ${className}`}>
      {/* Banner Section */}
      <Banner onCreateClick={onCreateClick} />

      {/* Main Content Container */}
      <div className="relative mt-[70px] z-10">
        <Container size="lg">
          {/* Search Section Paper */}
          <Paper variant="elevated" padding="lg" className="shadow-sm">
            <SearchField syncWithUrl />
            <div className="mt-3">
              <SelectedCategory />
            </div>
          </Paper>

          {/* Ideas List Section Paper */}
          <Paper
            as="main"
            variant="elevated"
            padding="lg"
            className="mt-6 shadow-sm"
          >
            <IdeaList
              onCreateClick={onCreateClick}
            />
          </Paper>
        </Container>
      </div>

      {/* Create Idea Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <IdeaForm
              isLoading={isSubmitting}
              onSubmit={onSubmitIdea}
              onCancel={onCloseModal}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-alert text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <span>{error}</span>
            <button
              onClick={onClearError}
              className="text-white hover:text-gray-200 ml-2"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasView;
