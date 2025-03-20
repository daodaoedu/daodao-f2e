import React, { FC } from 'react';
import { colors } from './index';

interface SubTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCategorySelect?: (path: string) => void;
}

const SubTabs: FC<SubTabsProps> = ({ activeTab, onTabChange, onCategorySelect }) => {
  // 主要分類標籤
  const tabs = [
    { id: 'forYou', label: '為您推薦' },
    { id: 'paths', label: '路徑 Paths' },
    { id: 'ideas', label: '想法' },
    { id: 'following', label: '關注中' },
  ];
  
  // 擴展標籤，包含原先CategoryGrid中的類別
  const categoryTabs = [
    {
      id: '/projects',
      label: '學習計畫',
      icon: (
        <svg className="w-5 h-5 text-primary-base" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      )
    },
    {
      id: '/ideas',
      label: '學習想法',
      icon: (
        <svg className="w-5 h-5 text-primary-base" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      )
    },
    {
      id: '/search',
      label: '學習資源',
      icon: (
        <svg className="w-5 h-5 text-primary-base" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      )
    },
    {
      id: '/partner',
      label: '學習夥伴',
      icon: (
        <svg className="w-5 h-5 text-primary-base" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="mb-6">
      {/* 主要標籤區域 */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`px-3 py-1 rounded-full text-xs transition-all duration-200 transform hover:-translate-y-[1px]`}
            style={{ 
              backgroundColor: activeTab === tab.id ? `${colors.primary}15` : 'rgb(243, 244, 246)',
              color: activeTab === tab.id ? colors.primary : 'rgb(75, 85, 99)'
            }}
            onClick={() => {
              console.log('Top tab clicked:', tab.id);
              onTabChange(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 類別標籤區域 */}
      {/* {onCategorySelect && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">按分類探索</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryTabs.map((category) => (
              <button 
                key={category.id}
                onClick={() => {
                  console.log('Category clicked:', category.id);
                  if (onCategorySelect) {
                    onCategorySelect(category.id);
                  }
                }}
                className="p-4 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary-palest flex items-center justify-center mb-3">
                  {category.icon}
                </div>
                <h4 className="text-lg font-medium">{category.label}</h4>
              </button>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SubTabs;