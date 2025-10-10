'use client';

import IdeaCreateContainer from '@/features/ideas/components/IdeaCreateContainer';
import { useExploreState } from '../model/useExploreState';
import { ExploreContent } from './ExploreContent';
import { ExploreTabs } from './ExploreTabs';
import { FloatingCreateButton } from './FloatingCreateButton';

// TODO: Add translation keys to Google Sheets and run `pnpm fetch:i18n`
// Required keys: pages.explore_tab_recommendation, pages.explore_tab_practice,
// pages.explore_tab_project, pages.explore_tab_idea
export function ExplorePageWidget() {
  const {
    activeTab,
    handleTabChange,
    showIdeaModal,
    handleCreateNew,
    handleCloseModal,
  } = useExploreState();

  return (
    <div className="min-h-screen bg-basic-white relative pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExploreTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onCreateNew={handleCreateNew}
        />

        <ExploreContent activeTab={activeTab} />
      </div>

      <FloatingCreateButton onCreateIdea={() => handleCreateNew('idea')} />

      {showIdeaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="idea-create-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
            <IdeaCreateContainer
              onSuccess={handleCloseModal}
              onError={(error) => console.error(error)}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
