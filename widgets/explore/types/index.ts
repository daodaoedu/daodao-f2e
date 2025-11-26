export interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateNew: (type: string) => void;
}

export interface FloatingCreateButtonProps {
  onCreateIdea: () => void;
}

// 統一的 ExploreSection Props
export interface BaseExploreSectionProps {
  showHeader?: boolean;
  showCreateButton?: boolean;
  showSearchBar?: boolean;
  className?: string;
}

// Explore 頁面狀態類型
export type ExploreTab = '推薦' | '想法' | '主題實踐' | '學習計劃';
