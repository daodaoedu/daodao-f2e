import React, { useCallback } from 'react';
import type { CreateIdeaSchema } from '@/services/modules/ideas';
import { useIdeasContext } from '../contexts';
import { useIdeaForm } from '../hooks';
import IdeasView from './IdeasView';

interface IdeasContainerProps {
  className?: string;
}

/**
 * 容器組件 - 處理 Ideas 頁面的業務邏輯
 * 管理狀態和副作用，將純數據傳遞給展示組件
 */
const IdeasContainer: React.FC<IdeasContainerProps> = ({ className }) => {
  const {
    state: contextState,
    showCreateModal,
    hideCreateModal,
    addLocalIdea
  } = useIdeasContext();

  const {
    createIdea,
    isSubmitting,
    error,
    clearError,
  } = useIdeaForm({
    onSuccess: (idea) => {
      // Add the new idea to local state immediately
      addLocalIdea(idea);
      hideCreateModal();
      console.log('Idea created successfully:', idea);
    },
    onError: (err: Error) => {
      console.error('Failed to create idea:', err);
    },
  });

  // Event handlers
  const handleCreateClick = useCallback(() => {
    showCreateModal();
  }, [showCreateModal]);

  const handleCloseModal = useCallback(() => {
    hideCreateModal();
    clearError();
  }, [hideCreateModal, clearError]);

  const handleSubmitIdea = useCallback(async (data: CreateIdeaSchema) => {
    await createIdea(data);
  }, [createIdea]);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return (
    <IdeasView
      showCreateModal={contextState.showCreateModal}
      isSubmitting={isSubmitting}
      error={error}
      onCreateClick={handleCreateClick}
      onCloseModal={handleCloseModal}
      onSubmitIdea={handleSubmitIdea}
      onClearError={handleClearError}
      className={className}
    />
  );
};

export default IdeasContainer;
