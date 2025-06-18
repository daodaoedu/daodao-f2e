import { ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { cn } from "@/utils/cn";

interface ExploreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateNew: (type: string) => void;
}

export function ExploreTabs({ activeTab, onTabChange, onCreateNew }: ExploreTabsProps) {
  const tabs = ['推薦', '主題實踐', '學習計劃', '想法'];

  const createOptions = [
    {
      id: 'practice',
      title: '主題實踐',
      description: '短期專注練習 (7-30天)'
    },
    {
      id: 'plan',
      title: '學習計劃',
      description: '深度系統學習 (2-6個月)'
    },
    {
      id: 'idea',
      title: '想法',
      description: '快速分享洞察'
    }
  ];

  return (
    <div className="border-b border-basic-200 mb-4 sm:mb-8 flex justify-center bg-basic-100 py-2 sm:py-4 px-4">
      <div className="w-full max-w-3xl">
        <nav className="flex items-center justify-between -mb-px">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => onTabChange(tab)}
                className={cn(
                  "py-2 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors rounded-none whitespace-nowrap flex-shrink-0",
                  activeTab === tab
                    ? "border-primary-base text-primary-base"
                    : "border-transparent text-basic-300 hover:text-basic-400 hover:border-basic-200"
                )}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="relative ml-2 sm:ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 sm:px-4 py-1 sm:py-2 text-primary-base hover:text-primary-darker font-medium hover:bg-primary-lightest rounded-lg text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">+ 開始</span>
                  <span className="sm:hidden">+</span>
                  <ChevronDown size={14} className="ml-1 transition-transform ui-open:rotate-180" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64 sm:w-72 mt-1" align="end">
                {createOptions.map((option, index) => (
                  <DropdownMenuItem
                    key={option.id}
                    className={cn(
                      "flex items-start w-full px-4 py-3 text-left hover:bg-primary-lightest cursor-pointer",
                      index < createOptions.length - 1 && "border-b border-basic-100"
                    )}
                    onClick={() => onCreateNew(option.id)}
                  >
                    <div>
                      <div className="font-medium text-basic-black">{option.title}</div>
                      <div className="text-sm text-basic-300 mt-1">{option.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </div>
    </div>
  );
}
