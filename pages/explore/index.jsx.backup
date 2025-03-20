import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SubNav from '@/shared/components/SubNav';
import dynamic from 'next/dynamic';
import styles from '@/styles/explore.module.css'; // 要確保創建此檔案

// 動態導入 Projects 頁面組件
const ProjectsComponent = dynamic(() => import('@/pages/projects'), {
  ssr: false,
  loading: () => <div className={styles['loading-placeholder']}>載入學習計畫中...</div>
});

// 動態導入 ProjectDetail 組件
const ProjectDetailComponent = dynamic(() => import('@/pages/projects/detail'), {
  ssr: false,
  loading: () => <div className={styles['loading-placeholder']}>載入計畫詳情中...</div>
});

function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // 從 URL 查詢參數初始化選中的分類和項目
  useEffect(() => {
    if (router.isReady) {
      const { category, id } = router.query;
      if (category) {
        // 設置選中的分類類型
        setSelectedCategory(category === 'project-detail' ? '/project-detail' : `/${category}`);
        if (category === 'project-detail' && id) {
          setSelectedProjectId(id);
        } else {
          setSelectedProjectId(null);
        }
      } else {
        // 如果沒有查詢參數，則重置為默認狀態
        setSelectedCategory(null);
        setSelectedProjectId(null);
      }
    }
  }, [router.isReady, router.query]);

  const handleCategorySelect = (path) => {
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

  return (
    <div>
      <SubNav type="explore" onCategorySelect={handleCategorySelect} />

      <div className="transition-all duration-300 ease-in-out">
        {!selectedCategory ? (
          // 顯示原有的首頁內容
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">探索學習世界</h1>
            <p className="text-lg text-gray-600 mb-8">
              瀏覽島島阿學平台上的各類學習資源、學習計畫與想法，發現你感興趣的內容
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 這裡可以放各種探索內容的預覽卡片 */}
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                <h2 className="text-xl font-bold mb-3">熱門學習計畫</h2>
                <p className="text-gray-600 mb-4">查看社群中最受歡迎的學習計畫，獲取靈感與指導</p>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('/projects')}
                  className="text-blue-500 font-medium flex items-center"
                >
                  查看更多
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 010-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                <h2 className="text-xl font-bold mb-3">精選學習資源</h2>
                <p className="text-gray-600 mb-4">探索各種優質學習資源，提升你的學習效率與深度</p>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('/search')}
                  className="text-blue-500 font-medium flex items-center"
                >
                  查看更多
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 010-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-500">
                <h2 className="text-xl font-bold mb-3">學習想法分享</h2>
                <p className="text-gray-600 mb-4">閱讀其他學習者的心得體會與想法，獲取靈感</p>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('/ideas')}
                  className="text-blue-500 font-medium flex items-center"
                >
                  查看更多
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 010-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // 根據選擇的分類顯示不同內容
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
              <div>
                <h1 className="text-3xl font-bold mb-6">學習計畫</h1>
                <p className="text-lg text-gray-600 mb-8">探索各種學習計畫，獲取靈感與方法</p>

                {/* 引入 Projects 頁面的內容，但包裝在 div 內以保持樣式絕密性 */}
                <div className={`${styles['projects-container']} ${styles['dynamic-content-container']}`}>
                  <ProjectsComponent
                    path="/explore"
                    onProjectClick={(projectId) => {
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
                    }}
                  />
                </div>
              </div>
            )}

            {selectedCategory === '/project-detail' && selectedProjectId && (
              <div>
                <h1 className="text-3xl font-bold mb-6">學習計畫詳情</h1>
                <div className={`${styles['project-detail-container']} ${styles['dynamic-content-container']}`}>
                  <ProjectDetailComponent projectId={selectedProjectId} inExplore />
                </div>
              </div>
            )}

            {selectedCategory === '/ideas' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">學習想法</h1>
                <p className="text-lg text-gray-600 mb-8">探索社群成員分享的各種學習想法與心得</p>

                {/* 這裡可以放置學習想法相關的內容 */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3">如何更有效地進行深度閱讀？</h2>
                    <p className="text-gray-600 mb-4">我發現在閱讀專業書籍時經常走神，這是我嘗試的幾種提高專注力的方法...</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">分享者：陳小明</span>
                      <span>2023/12/10</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3">線上學習與實體課程的優缺點比較</h2>
                    <p className="text-gray-600 mb-4">經過一年的線上課程和實體工作坊體驗，我總結了兩種學習方式的優缺點...</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">分享者：林小華</span>
                      <span>2023/11/28</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3">自學一門新技能的心路歷程</h2>
                    <p className="text-gray-600 mb-4">從零開始學習前端開發，這是我遇到的挑戰和發現的資源...</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">分享者：張大為</span>
                      <span>2023/11/15</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === '/search' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">學習資源</h1>
                <p className="text-lg text-gray-600 mb-8">探索各類學習資源，助你更有效地學習</p>

                {/* 這裡可以放置學習資源相關的內容 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">Coursera 線上課程平台</h2>
                      <p className="text-gray-600 mb-4">提供世界頂尖大學和機構的線上課程</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">類型：線上課程</span>
                        <span>語言：多語言</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">Khan Academy 教學影片</h2>
                      <p className="text-gray-600 mb-4">免費教育資源，涵蓋數學、科學等多個領域</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">類型：影片教學</span>
                        <span>語言：英文</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">學習資源工具包</h2>
                      <p className="text-gray-600 mb-4">整合各類學習工具和資源的工具包</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-3">類型：綜合工具</span>
                        <span>語言：中文</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === '/partner' && (
              <div>
                <h1 className="text-3xl font-bold mb-6">學習夥伴</h1>
                <p className="text-lg text-gray-600 mb-8">尋找學習夥伴，互相督促，共同進步</p>

                {/* 這裡可以放置學習夥伴相關的內容 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3">英語學習小組</h2>
                    <p className="text-gray-600 mb-4">每週三次線上會議，一起練習英語口說和聽力</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-3">人數：4/6</span>
                      <span>時間：每週二四六晚上8點</span>
                    </div>
                    <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">申請加入</button>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3">程式設計學習夥伴</h2>
                    <p className="text-gray-600 mb-4">尋找一起學習 Python 的夥伴，互相解題和分享學習資源</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-3">人數：1/2</span>
                      <span>時間：彈性安排</span>
                    </div>
                    <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">申請加入</button>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-3">學習讀書會</h2>
                    <p className="text-gray-600 mb-4">每月選擇一本書籍，一起閱讀討論，分享心得</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-3">人數：5/10</span>
                      <span>時間：每月最後一個週六</span>
                    </div>
                    <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">申請加入</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExplorePage;
