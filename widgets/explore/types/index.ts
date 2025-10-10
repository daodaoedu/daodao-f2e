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
