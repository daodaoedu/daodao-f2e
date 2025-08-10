import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Container } from '@/components/ui/container';
import IdeaList from './IdeaList';
import IdeaCreateContainer from './IdeaCreateContainer';
import IdeasErrorBoundary, { NetworkError, useNetworkRetry } from './ErrorBoundary';

interface IdeasFeatureProps {
  className?: string;
}

// Section component similar to new-resource structure
const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}> = ({ children, className = '', as: Component = 'section' }) => (
  <Component
    className={cn(
      'flex flex-col gap-6 px-5 py-6 md:px-24 md:py-8',
      className
    )}
  >
    {children}
  </Component>
);

const IdeasFeature: React.FC<IdeasFeatureProps> = ({ className = '' }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 網路錯誤重試邏輯
  const { retry: retryCreateIdea, isRetrying } = useNetworkRetry(async () => {
    console.log('Retrying failed operations...');
  });

  const handleIdeaCreateSuccess = useCallback((ideaId: string) => {
    console.log('Idea created successfully with ID:', ideaId);
    setShowCreateModal(false);
  }, []);

  const handleIdeaCreateError = useCallback((error: Error) => {
    console.error('Failed to create idea:', error);
  }, []);

  const handleShowCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleHideCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  return (
    <IdeasErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Ideas feature error:', error, errorInfo);
      }}
    >
      <div className={cn('bg-primary-palest min-h-screen', className)}>
        {/* Main Content Container */}
        <div className="relative pt-[70px] z-10">
          <Container size="lg">

            {/* Ideas List Section */}
            <Section as="main" className="">
              <IdeasErrorBoundary
                fallback={<NetworkError onRetry={retryCreateIdea} isRetrying={isRetrying} />}
              >
                <IdeaList onCreateClick={handleShowCreateModal} />
              </IdeasErrorBoundary>
            </Section>
          </Container>
        </div>

        {/* Create Idea Modal */}
        {showCreateModal && (
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
                <IdeaCreateContainer
                  onSuccess={handleIdeaCreateSuccess}
                  onError={handleIdeaCreateError}
                  onCancel={handleHideCreateModal}
                />
              </IdeasErrorBoundary>
            </div>
          </div>
        )}

      </div>
    </IdeasErrorBoundary>
  );
};

export default IdeasFeature;
