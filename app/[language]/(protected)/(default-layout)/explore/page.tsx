'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExploreTabs, FloatingCreateButton } from '@/widgets/explore';
import IdeasExploreSection from '@/features/ideas/components/IdeasExploreSection';
import PracticeExploreSection from '@/features/practice/components/List/PracticeExploreSection';
import ProjectsExploreSection from '@/features/projects/components/ProjectsExploreSection';
import IdeaCreateContainer from '@/features/ideas/components/IdeaCreateContainer';

// TODO: Add translation keys to Google Sheets and run `pnpm fetch:i18n`
// Required keys: pages.explore_tab_recommendation, pages.explore_tab_practice,
// pages.explore_tab_project, pages.explore_tab_idea
export default function ExplorePage() {
  const router = useRouter();
  // Using hardcoded strings temporarily until translation keys are added
  const [activeTab, setActiveTab] = useState('推薦');
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  const handleCreateNew = (type: string) => {
    if (type === 'idea') {
      setShowIdeaModal(true);
    } else if (type === 'practice') {
      router.push('/practice/create');
    } else if (type === 'plan') {
      router.push('/projects/create');
    }
  };

  return (
    <div className="min-h-screen bg-basic-white relative pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExploreTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCreateNew={handleCreateNew}
        />

        <div className="space-y-8 mb-16">
            {/* Ideas */}
            <div
              role="tabpanel"
              id="想法-panel"
              aria-labelledby="想法-tab"
              hidden={activeTab !== '推薦' && activeTab !== '想法'}
            >
              {(activeTab === '推薦' || activeTab === '想法') && (
                <IdeasExploreSection
                  showHeader={false}
                  showCreateButton={false}
                  showSearchBar={false}
                />
              )}
            </div>

            {/* Practices */}
            <div
              role="tabpanel"
              id="主題實踐-panel"
              aria-labelledby="主題實踐-tab"
              hidden={activeTab !== '推薦' && activeTab !== '主題實踐'}
            >
              {(activeTab === '推薦' || activeTab === '主題實踐') && (
                <PracticeExploreSection
                  showHeader={false}
                  showCreateButton={false}
                  showSearchBar={false}
                />
              )}
            </div>

            {/* Projects */}
            <div
              role="tabpanel"
              id="學習計劃-panel"
              aria-labelledby="學習計劃-tab"
              hidden={activeTab !== '推薦' && activeTab !== '學習計劃'}
            >
              {(activeTab === '推薦' || activeTab === '學習計劃') && (
                <ProjectsExploreSection
                  showHeader={false}
                  showCreateButton={false}
                  showSearchBar={false}
                />
              )}
            </div>
          </div>
      </div>

      <FloatingCreateButton onCreateIdea={() => setShowIdeaModal(true)} />

      {showIdeaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="idea-create-title"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
            <IdeaCreateContainer
              onSuccess={() => setShowIdeaModal(false)}
              onError={(error) => console.error(error)}
              onCancel={() => setShowIdeaModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
