import React from 'react';
import { Paper } from '@/components/atoms/paper';
import { Container } from '@/components/atoms/container';
import type { CreateIdeaSchema } from '@/services/modules/ideas';
import Banner from './Banner';
import SearchField from './SearchField';
import SelectedCategory from './SelectedCategory';
import IdeaList from './IdeaList';
import IdeaForm from './IdeaForm';
import IdeasErrorBoundary, { NetworkError, useNetworkRetry } from './ErrorBoundary';
import { IdeasProvider, useIdeasContext } from '../contexts';
import { useIdeaForm } from '../hooks';

interface IdeasMainContentProps {
  className?: string;
}

const IdeasMainContent: React.FC<IdeasMainContentProps> = ({ className = '' }) => {
  const { state: contextState, showCreateModal, hideCreateModal, addLocalIdea } = useIdeasContext();

  // Form hook for creating ideas
  const {
    createIdea,
    isSubmitting,
    error: formError,
    clearError,
  } = useIdeaForm({
    onSuccess: (idea) => {
      // Add the new idea to local state immediately
      addLocalIdea(idea);
      hideCreateModal();
      // Show success message
      console.log('Idea created successfully and added to list:', idea);
    },
    onError: (error) => {
      console.error('Failed to create idea:', error);
    },
  });

  // 網路錯誤重試邏輯
  const { retry: retryCreateIdea, isRetrying } = useNetworkRetry(async () => {
    // 這裡可以重試失敗的操作
    console.log('Retrying failed operations...');
  });

  const handleCreateIdea = async (data: CreateIdeaSchema) => {
    try {
      await createIdea(data);
    } catch (createError) {
      // 錯誤處理已在 useIdeaForm 中完成
      console.error('Create idea error:', createError);
    }
  };

  return (
    <IdeasErrorBoundary
      onError={(error, errorInfo) => {
        // 這裡可以添加錯誤監控服務
        console.error('Ideas feature error:', error, errorInfo);
      }}
    >
      <div className={`bg-primary-palest min-h-screen ${className}`}>
        {/* Banner Section */}
        <Banner onCreateClick={showCreateModal} />

        {/* Main Content Container - 參考 Group 頁面結構 */}
        <div className="relative mt-[70px] z-10">
          <Container size="lg">
            {/* Search Section Paper */}
            <IdeasErrorBoundary fallback={<NetworkError onRetry={retryCreateIdea} isRetrying={isRetrying} />}>
              <Paper variant="elevated" padding="lg" className="shadow-sm">
                <SearchField syncWithUrl />
                <div className="mt-3">
                  <SelectedCategory />
                </div>
              </Paper>
            </IdeasErrorBoundary>

            {/* Ideas List Section Paper */}
            <IdeasErrorBoundary fallback={<NetworkError onRetry={retryCreateIdea} isRetrying={isRetrying} />}>
              <Paper
                as="main"
                variant="elevated"
                padding="lg"
                className="mt-6 shadow-sm"
              >
                <IdeaList
                  onCreateClick={showCreateModal}
                />
              </Paper>
            </IdeasErrorBoundary>
          </Container>
        </div>

        {/* Create Idea Modal */}
        {contextState.showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <IdeasErrorBoundary
                fallback={(
                  <div className="bg-white rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">表單出現問題</h3>
                    <NetworkError onRetry={retryCreateIdea} isRetrying={isRetrying} />
                  </div>
                )}
              >
                <IdeaForm
                  isLoading={isSubmitting}
                  onSubmit={handleCreateIdea}
                  onCancel={() => {
                    hideCreateModal();
                    clearError();
                  }}
                />
              </IdeasErrorBoundary>
            </div>
          </div>
        )}

        {/* Error Display */}
        {formError && (
          <div className="fixed bottom-4 right-4 bg-alert text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <span>{formError}</span>
              <button
                onClick={clearError}
                className="text-white hover:text-gray-200 ml-2"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </IdeasErrorBoundary>
  );
};

// Main Ideas Component with Provider
const Ideas: React.FC<IdeasMainContentProps> = (props) => {
  return (
    <IdeasProvider>
      <IdeasErrorBoundary>
        <IdeasMainContent {...props} />
      </IdeasErrorBoundary>
    </IdeasProvider>
  );
};

export default Ideas;
