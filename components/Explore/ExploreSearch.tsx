import React, { FC, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const ExploreSearch: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 實現搜索邏輯
    console.log('搜索查詢:', searchQuery);
    // 可以添加路由跳轉到搜索結果頁面
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-1 rounded-full flex shadow-md mb-8">
      <form onSubmit={handleSearch} className="flex w-full">
        <div className="flex-1 pl-5 flex items-center text-basic-400">
          <FiSearch className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋學習資源、計畫或揪團..."
            className="bg-transparent border-none outline-none w-full py-3 placeholder-gray-400 text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="bg-primary-base text-white px-5 py-3 rounded-full font-medium hover:bg-primary-darker transition-colors"
        >
          搜尋
        </button>
      </form>
    </div>
  );
};

export default ExploreSearch;