'use client';

import IdeasExploreSection from '@/features/ideas/components/IdeasExploreSection';
import PracticeExploreSection from '@/features/practice/components/List/PracticeExploreSection';
import ProjectsExploreSection from '@/features/projects/components/ProjectsExploreSection';
import type { ExploreTab } from '../types';

interface ExploreContentProps {
  activeTab: ExploreTab;
}

export function ExploreContent({ activeTab }: ExploreContentProps) {
  return (
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
          />
        )}
      </div>
    </div>
  );
}
