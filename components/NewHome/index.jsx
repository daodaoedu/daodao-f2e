import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoArrowUpRight, GoCheckCircle, GoBook, GoHeart } from 'react-icons/go';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

function NewHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setSubTab] = useState('forYou');
  
  // 使用島島阿學的現有配色方案
  const colors = {
    primary: '#16B9B3',     // primary.base
    secondary: '#FF9526',   // tips
    accent: '#86C84A',      // success
    dark: '#293A3D',        // basic.500
    light: '#F3FCFC',       // primary.palest
  };
  
  // 熱門學習計畫資料
  const POPULAR_PLANS = [
    {
      title: "網頁開發入門 60 天挑戰",
      author: "張小明",
      avatar: "/new-logo.png",
      description: "從零基礎到前端工程師，包含 HTML、CSS 和 JavaScript 的完整學習路徑",
      likes: 245,
      color: "bg-primary-base"
    },
    {
      title: "JLPT N2 日文能力檢定準備",
      author: "王小花",
      avatar: "/new-logo.png",
      description: "三個月內高效備考日文 N2 檢定，包含文法、單字與聽力的完整準備",
      likes: 187,
      color: "bg-primary-dark"
    },
    {
      title: "數位攝影從入門到精通",
      author: "林大方",
      avatar: "/new-logo.png",
      description: "系統性學習攝影基礎、構圖技巧、光線運用與後製處理",
      likes: 156,
      color: "bg-primary-base"
    }
  ];
  


  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow">
      {/* 導航欄 */}
      <div className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>島島阿學</h1>
        <div className="flex space-x-3">
          <button 
            className={`px-3 py-1 font-medium ${activeTab === 'home' ? 'border-b-2' : ''}`} 
            style={{ 
              color: activeTab === 'home' ? colors.primary : 'gray', 
              borderColor: activeTab === 'home' ? colors.primary : 'transparent'
            }}
            onClick={() => setActiveTab('home')}
          >
            首頁
          </button>
          <button 
            className={`px-3 py-1 font-medium ${activeTab === 'explore' ? 'border-b-2' : ''}`} 
            style={{ 
              color: activeTab === 'explore' ? colors.primary : 'gray', 
              borderColor: activeTab === 'explore' ? colors.primary : 'transparent'
            }}
            onClick={() => setActiveTab('explore')}
          >
            探索
          </button>
          <button 
            className={`px-3 py-1 font-medium ${activeTab === 'connect' ? 'border-b-2' : ''}`} 
            style={{ 
              color: activeTab === 'connect' ? colors.primary : 'gray', 
              borderColor: activeTab === 'connect' ? colors.primary : 'transparent'
            }}
            onClick={() => setActiveTab('connect')}
          >
            連結
          </button>
          <button 
            className="px-4 py-1 rounded-full text-white" 
            style={{ backgroundColor: colors.primary }}
          >
            註冊
          </button>
        </div>
      </div>
      
      {/* 內容區塊 */}
      <div className="p-4">
        {/* 首頁頁籤 */}
        {activeTab === 'home' && (
          <>
            {/* 英雄區塊 */}
            <div className="p-8 relative overflow-hidden rounded-lg mb-6" 
                style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)` }}>
              {/* 裝飾元素 */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20" 
                  style={{ backgroundColor: colors.light, transform: 'translate(20%, -30%)' }}></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-20" 
                  style={{ backgroundColor: colors.accent, transform: 'translate(30%, 30%)' }}></div>
              
              <div className="relative z-10 text-white max-w-2xl">
                <h2 className="text-4xl font-bold mb-4">自主學習與集體智慧的交匯處</h2>
                <p className="text-xl opacity-90 mb-6">使學習更加可見，成就更加具體。</p>
                <div className="flex space-x-4">
                  <button className="px-6 py-3 rounded-md font-bold" 
                          style={{ backgroundColor: colors.accent, color: colors.dark }}
                          onClick={() => router.push('/register')}>
                    開始使用
                  </button>
                  <button className="px-6 py-3 rounded-md font-bold border-2 border-white"
                          onClick={() => router.push('/about')}>
                    了解更多
                  </button>
                </div>
              </div>
            </div>
            
            {/* 統計數據 */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded text-center" style={{ backgroundColor: `${colors.primary}10` }}>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>10,000+</p>
                <p className="text-sm text-gray-600">學習資源</p>
              </div>
              <div className="p-4 rounded text-center" style={{ backgroundColor: `${colors.secondary}10` }}>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>500+</p>
                <p className="text-sm text-gray-600">學習圈組</p>
              </div>
              <div className="p-4 rounded text-center" style={{ backgroundColor: `${colors.accent}10` }}>
                <p className="text-2xl font-bold" style={{ color: colors.dark }}>20,000+</p>
                <p className="text-sm text-gray-600">已完成專案</p>
              </div>
            </div>
            
            {/* 功能介紹 */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6" style={{ color: colors.dark }}>島島阿學如何運作</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold"
                      style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}>1</div>
                  <h4 className="text-xl font-bold mb-2">加入學習圈組</h4>
                  <p className="text-gray-600">與志同道合的人連結。獲得結構、問責制和社群支持。</p>
                </div>
                
                <div className="border rounded-lg p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold"
                      style={{ backgroundColor: `${colors.secondary}20`, color: colors.secondary }}>2</div>
                  <h4 className="text-xl font-bold mb-2">創建學習路徑</h4>
                  <p className="text-gray-600">將目標分解為可行的路徑，設定明確的里程碑並追蹤進度。</p>
                </div>
                
                <div className="border rounded-lg p-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl font-bold"
                      style={{ backgroundColor: `${colors.accent}20`, color: colors.dark }}>3</div>
                  <h4 className="text-xl font-bold mb-2">建立學習作品集</h4>
                  <p className="text-gray-600">通過精美的視覺作品集展示您的學習歷程、技能和成就。</p>
                </div>
              </div>
            </div>
            
            {/* 行動呼籲 */}
            <div className="p-8 text-center mb-8 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>準備好開始您的學習之旅了嗎？</h3>
              <p className="text-gray-600 mb-6">加入成千上萬的求知者，他們正在轉變學習方式。</p>
              <button className="px-8 py-3 rounded-lg text-white font-bold" 
                      style={{ backgroundColor: colors.primary }}
                      onClick={() => router.push('/register')}>
                免費註冊
              </button>
            </div>
          </>
        )}
        
        {/* 探索頁籤 */}
        {activeTab === 'explore' && (
          <>
            {/* 橫幅 */}
            <div className="p-6 rounded-lg text-white mb-6" 
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.dark})` }}>
              <h3 className="text-xl font-bold mb-2">探索學習路徑</h3>
              <p className="mb-4">發掘由我們社群創建的精選學習體驗</p>
              <div className="flex space-x-3">
                <button className="px-4 py-2 rounded-md text-sm" 
                        style={{ backgroundColor: 'white', color: colors.primary }}
                        onClick={() => router.push('/learning-plan/create')}>
                  開始一個路徑
                </button>
                <button className="px-4 py-2 rounded-md text-sm border border-white"
                        onClick={() => router.push('/learning-plan')}>
                  瀏覽路徑
                </button>
              </div>
            </div>
            
            {/* 子導航標籤 */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              <button 
                className={`px-3 py-1 rounded-full text-xs ${subTab === 'forYou' ? '' : ''}`}
                style={{ 
                  backgroundColor: subTab === 'forYou' ? `${colors.primary}15` : 'rgb(243, 244, 246)',
                  color: subTab === 'forYou' ? colors.primary : 'rgb(75, 85, 99)'
                }}
                onClick={() => setSubTab('forYou')}
              >
                為您推薦
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs ${subTab === 'paths' ? '' : ''}`}
                style={{ 
                  backgroundColor: subTab === 'paths' ? `${colors.primary}15` : 'rgb(243, 244, 246)',
                  color: subTab === 'paths' ? colors.primary : 'rgb(75, 85, 99)'
                }}
                onClick={() => setSubTab('paths')}
              >
                路徑 Paths
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs ${subTab === 'ideas' ? '' : ''}`}
                style={{ 
                  backgroundColor: subTab === 'ideas' ? `${colors.primary}15` : 'rgb(243, 244, 246)',
                  color: subTab === 'ideas' ? colors.primary : 'rgb(75, 85, 99)'
                }}
                onClick={() => setSubTab('ideas')}
              >
                想法
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs ${subTab === 'following' ? '' : ''}`}
                style={{ 
                  backgroundColor: subTab === 'following' ? `${colors.primary}15` : 'rgb(243, 244, 246)',
                  color: subTab === 'following' ? colors.primary : 'rgb(75, 85, 99)'
                }}
                onClick={() => setSubTab('following')}
              >
                關注中
              </button>
            </div>
            
            {/* 學習路徑卡片 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: colors.dark }}>熱門學習路徑</h3>
                <button className="text-xs" 
                        style={{ color: colors.primary }}
                        onClick={() => router.push('/learning-plan')}>查看全部</button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {POPULAR_PLANS.map((plan, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex">
                      <div className="w-16 h-16 rounded-lg mr-4" 
                          style={{ backgroundColor: `${colors.primary}15` }}></div>
                      <div>
                        <h4 className="font-bold mb-1">{plan.title}</h4>
                        <p className="text-xs text-gray-500 mb-2">由 {plan.author} 建立 • {plan.likes} 人喜歡</p>
                        <div className="flex space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-full" 
                                style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                            學習路徑
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full" 
                                style={{ backgroundColor: `${colors.secondary}15`, color: colors.secondary }}>
                            初學者
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 想法區塊 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold" style={{ color: colors.dark }}>最新想法</h3>
                <button className="text-xs" 
                        style={{ color: colors.primary }}
                        onClick={() => router.push('/ideas')}>查看全部</button>
              </div>
              
              <div className="border rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-xs"
                       style={{ backgroundColor: colors.primary + '30', color: colors.primary }}>
                    MK
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-bold text-sm mr-2">使用心智圖提升記憶力</span>
                      <span className="text-xs text-gray-500">2小時前</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      我發現創建視覺心智圖有助於回憶和理解複雜主題。這是我使用的技巧...
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      #學習技巧
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* 連結頁籤 */}
        {activeTab === 'connect' && (
          <div className="text-center p-4">
            <p className="mb-4">連結社群和參與活動</p>
            <button 
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: colors.primary }}
              onClick={() => router.push('/connect')}
            >
              前往連結頁面
            </button>
          </div>
        )}
      </div>
      
      {/* 頁尾 */}
      <div className="border-t p-4 text-center text-gray-500 text-sm">
        <p>© 2025 島島阿學 - 自主學習與集體智慧的交匯處</p>
      </div>
    </div>
  );
}

export default NewHome;