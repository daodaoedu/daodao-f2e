import React from 'react';
import SubNav from '@/shared/components/SubNav';
import Link from 'next/link';

function ExchangePage() {
  return (
    <div>
      <SubNav type="exchange" />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">交流與連結</h1>
        <p className="text-lg text-gray-600 mb-8">
          參與各類學習活動與揪團，認識志同道合的夥伴，共同成長進步
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 這裡可以放各種交流內容的預覽卡片 */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500">
            <h2 className="text-xl font-bold mb-3">熱門揪團</h2>
            <p className="text-gray-600 mb-4">瀏覽或加入各種學習揪團，與志同道合的夥伴一起學習成長</p>
            <Link href="/group" className="text-blue-500 font-medium flex items-center">
              查看更多
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 010-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
            <h2 className="text-xl font-bold mb-3">近期活動</h2>
            <p className="text-gray-600 mb-4">查看並報名參加最新的線上、線下學習活動與工作坊</p>
            <Link href="/activities" className="text-blue-500 font-medium flex items-center">
              查看更多
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 010-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
            <h2 className="text-xl font-bold mb-3">社群交流</h2>
            <p className="text-gray-600 mb-4">加入島島阿學社群，認識更多學習夥伴，參與各種討論</p>
            <Link href="/join" className="text-blue-500 font-medium flex items-center">
              查看更多
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 010-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">最新活動</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 這裡可以放最新活動的卡片 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-40 bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-500 text-4xl">🎓</span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-gray-500">2025/4/15</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">線上</span>
                </div>
                <h3 className="font-bold mb-2">Python 資料分析工作坊</h3>
                <p className="text-sm text-gray-600 mb-3">從基礎開始學習如何使用 Python 進行資料分析與視覺化</p>
                <Link href="/activities" className="text-blue-500 text-sm font-medium">了解更多</Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-40 bg-amber-100 flex items-center justify-center">
                <span className="text-amber-500 text-4xl">📚</span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-gray-500">2025/4/20</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">線下</span>
                </div>
                <h3 className="font-bold mb-2">斜槓創業讀書會</h3>
                <p className="text-sm text-gray-600 mb-3">探討如何在數位時代打造個人品牌與多元收入來源</p>
                <Link href="/activities" className="text-blue-500 text-sm font-medium">了解更多</Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-40 bg-green-100 flex items-center justify-center">
                <span className="text-green-500 text-4xl">🌱</span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-gray-500">2025/4/26</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">線下</span>
                </div>
                <h3 className="font-bold mb-2">永續設計思考工作坊</h3>
                <p className="text-sm text-gray-600 mb-3">學習如何將永續理念融入設計思考過程，創造更有社會影響力的作品</p>
                <Link href="/activities" className="text-blue-500 text-sm font-medium">了解更多</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExchangePage;
