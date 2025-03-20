import React, { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';
// SubNavWithSearch 已移除
import styles from '@/styles/explore.module.css';

// 導入所有子組件
import {
  ExploreBanner,
  SubTabs,
  LearningPathList,
  IdeasList,
  ProjectsContent,
  IdeasContent,
  ResourcesContent,
  PartnersContent
} from './components';

// 配色方案
export const colors = {
  primary: '#16B9B3',     // primary.base
  secondary: '#FF9526',   // tips
  accent: '#86C84A',      // success
  dark: '#293A3D',        // basic.500
  light: '#F3FCFC',       // primary.palest
};

const ExplorePage: FC = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<string>('forYou');

  // 從 URL 查詢參數初始化選中的分類和項目
  useEffect(() => {
    if (router.isReady) {
      const { category, id, tab } = router.query;
      if (category) {
        // 設置選中的分類類型
        setSelectedCategory(category === 'project-detail' ? '/project-detail' : `/${category}`);
        if (category === 'project-detail' && id) {
          setSelectedProjectId(id as string);
        } else {
          setSelectedProjectId(null);
        }
      } else {
        // 如果沒有查詢參數，則重置為默認狀態
        setSelectedCategory(null);
        setSelectedProjectId(null);
      }
      
      // 如果有 tab 參數，設置子頁籤
      if (tab) {
        setSubTab(tab as string);
      }
    }
  }, [router.isReady, router.query]);

  const handleCategorySelect = (path: string) => {
    console.log('handleCategorySelect called with path:', path);
    
    // 防止事件沖突，使用非同步執行
    setTimeout(() => {
      // 更新狀態
      setSelectedCategory(path);

      // 更新 URL 查詢參數，但不進行實際的頁面跳轉
      const category = path.substring(1); // 移除開頭的 '/'

      // 使用 push 而不是 replace，確保 URL 歷史正確記錄
      router.push(
        {
          pathname: '/explore',
          query: { category }
        },
        undefined,
        { shallow: true }
      ).then(() => {
        // 在路由變更完成後，確保組件狀態與 URL 保持一致
        console.log(`Category updated to: ${category}`);
      }).catch((err) => {
        console.error('Failed to update URL:', err);
      });
    }, 10); // 短暫延遲以確保事件處理順序
  };

  // 返回探索首頁
  const backToExplore = () => {
    setSelectedCategory(null);
    router.push('/explore', undefined, { shallow: true })
      .then(() => {
        console.log('Redirected back to explore homepage');
      })
      .catch((err) => {
        console.error('Failed to redirect back:', err);
      });
  };

  const handleProjectClick = (projectId: string) => {
    // 當點擊項目時，更新 URL 和狀態
    setSelectedProjectId(projectId);
    setSelectedCategory('/project-detail');
    router.push(
      {
        pathname: '/explore',
        query: { category: 'project-detail', id: projectId }
      },
      undefined,
      { shallow: true }
    ).then(() => {
      console.log(`Project detail view loaded for ID: ${projectId}`);
    }).catch((err) => {
      console.error('Failed to load project detail:', err);
    });
  };

  const handleSubTabChange = (tab: string) => {
    console.log('handleSubTabChange called with tab:', tab);
    setSubTab(tab);
    
    // 更新URL
    router.push({
      pathname: '/explore',
      query: { tab }
    }, undefined, { shallow: true }).then(() => {
      console.log(`SubTab updated to: ${tab}`);
    }).catch((err) => {
      console.error('Failed to update URL for tab:', err);
    });
  };

  return (
    <div>
      <div className="transition-all duration-300 ease-in-out">
        {!selectedCategory ? (
          // 新的探索首頁設計
          <div className="container mx-auto px-4 py-8">
            <ExploreBanner />
            <SubTabs 
              activeTab={subTab} 
              onTabChange={handleSubTabChange} 
              onCategorySelect={handleCategorySelect}
            />
            {/* 根據選中的標籤顯示不同內容 */}
            <div className="mt-8">
              {subTab === 'forYou' && (
                <div>
                  <LearningPathList />
                  <div className="mt-8">
                    <IdeasList />
                  </div>
                </div>
              )}
              
              {subTab === 'paths' && (
                <div>
                  <LearningPathList />
                </div>
              )}
              
              {subTab === 'ideas' && (
                <div>
                  <IdeasList />
                </div>
              )}
              
              {subTab === 'following' && (
                <div>
                  <p className="text-gray-600">您關注的內容將在這裡顯示</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // 顯示選擇的分類內容 (保留原有邏輯)
          <div className="container mx-auto px-4 py-8">
            {/* 添加返回按鈕 */}
            <div className="mb-6">
              <button
                type="button"
                onClick={selectedCategory === '/project-detail' ?
                  () => handleCategorySelect('/projects') : backToExplore}
                className="flex items-center text-primary-base hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                {selectedCategory === '/project-detail' ? '返回學習計畫列表' : '返回探索首頁'}
              </button>
            </div>

            {selectedCategory === '/projects' && (
              <ProjectsContent onProjectClick={handleProjectClick} />
            )}

            {selectedCategory === '/project-detail' && selectedProjectId && (
              <div>
                <h1 className="text-3xl font-bold mb-6">學習計畫詳情</h1>
                <div className={`${styles['project-detail-container']} ${styles['dynamic-content-container']}`}>
                  {/* 使用動態導入的 ProjectDetailComponent */}
                  {React.createElement(
                    require('@/pages/projects/detail').default,
                    { projectId: selectedProjectId, inExplore: true }
                  )}
                </div>
              </div>
            )}

            {selectedCategory === '/ideas' && <IdeasContent />}
            {selectedCategory === '/search' && <ResourcesContent />}
            {selectedCategory === '/partner' && <PartnersContent />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;