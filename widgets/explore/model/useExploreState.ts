'use client';

import { useState } from 'react';
import { useRouter } from '@/shared/i18n/navigation';
import type { ExploreTab } from '../types';

export function useExploreState() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ExploreTab>('推薦');
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

  const handleCloseModal = () => {
    setShowIdeaModal(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ExploreTab);
  };

  return {
    activeTab,
    handleTabChange,
    showIdeaModal,
    handleCreateNew,
    handleCloseModal,
  };
}
