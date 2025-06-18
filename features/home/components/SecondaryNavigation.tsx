import { Button } from "@/components/atoms/button";
import { cn } from "@/utils/cn";

interface SecondaryNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SecondaryNavigation({ activeTab, onTabChange }: SecondaryNavigationProps) {
  const tabs = [
    { id: 'explore', label: '探索' },
    { id: 'community', label: '交流' },
    { id: 'resources', label: '資源' }
  ];

  const handleResourcesClick = () => {
    // 直接導航到 /new-resource 頁面
    window.location.href = '/new-resource';
  };

  return (
    <header className="bg-primary-base shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => {
                  if (tab.id === 'resources') {
                    handleResourcesClick();
                  } else {
                    onTabChange(tab.id);
                  }
                }}
                className={cn(
                  "font-medium transition-colors px-3 py-2 rounded-2xl",
                  activeTab === tab.id
                    ? "text-basic-white bg-primary-darker"
                    : "text-primary-lightest hover:text-basic-white hover:bg-primary-darker"
                )}
              >
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
