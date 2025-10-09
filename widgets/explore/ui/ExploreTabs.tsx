'use client';

import { Button } from '@/shared/ui/button';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import type { ExploreTabsProps } from '../types';

// TODO: Add translation support after keys are added to Google Sheets
export function ExploreTabs({ activeTab, onTabChange, onCreateNew }: ExploreTabsProps) {
  const tabs = [
    '推薦',
    '主題實踐',
    '學習計劃',
    '想法',
  ];

  const createOptions = [
    {
      id: 'practice',
      title: '主題實踐',
      description: '短期專注練習 (7-30天)',
    },
    {
      id: 'plan',
      title: '學習計劃',
      description: '深度系統學習 (2-6個月)',
    },
    {
      id: 'idea',
      title: '想法',
      description: '快速分享洞察',
    },
  ];

  return (
    <div className="mb-4 sm:mb-4 flex justify-center py-2 sm:py-4 px-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl bg-basic-white border border-basic-200 rounded-lg px-4 py-4">
        <nav
          className="flex items-center justify-between"
          role="navigation"
          aria-label="探索頁籤"
        >
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => onTabChange(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`${tab}-panel`}
                className={cn(
                  'py-2 sm:py-4 px-1 sm:px-2 font-medium text-xs sm:text-sm transition-colors rounded-lg whitespace-nowrap flex-shrink-0',
                  activeTab === tab
                    ? 'bg-primary-base text-white hover:bg-primary-darker hover:text-white'
                    : 'text-basic-500 hover:text-primary-base hover:bg-primary-base/10'
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
                  aria-label="創建新項目"
                  className="px-2 sm:px-4 py-1 sm:py-2 text-primary-base hover:text-primary-darker font-medium hover:bg-primary-lightest rounded-lg text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">+ 開始</span>
                  <span className="sm:hidden">+</span>
                  <ChevronDown size={14} className="ml-1" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-64 sm:w-72 mt-1 p-2 bg-basic-white border-basic-200 text-basic-500"
                align="end"
              >
                {createOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    className="flex items-start w-full px-4 py-3 text-left cursor-pointer hover:bg-basic-100 focus:bg-basic-100"
                    onClick={() => onCreateNew(option.id)}
                  >
                    <div>
                      <div className="font-medium text-basic-500">{option.title}</div>
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
