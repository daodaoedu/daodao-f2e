import React from 'react';
import Banner from './Banner';
import SearchField from './SearchField';
import IdeaList from './IdeaList';
import More from './More';

const Idea: React.FC = () => {
  // Define the necessary state or props for More component
  const isMore = true; // Set this based on your logic
  const onLoadMore = () => {
    // Define your load more logic here
  };

  return (
    <div className="bg-[#f3fcfc]">
      <Banner />
      {/* Container: 原 StyledContainer 改用 Tailwind 調整寬度與間距 */}
      <div className="relative mt-[70px] mx-auto w-full lg:px-0 rounded-2xl">
        {/* Paper 區塊：背景白色、陰影與內間距 */}
        <div className="bg-white shadow p-1 rounded-2xl">
          <SearchField />
        </div>
        {/* 主要內容區塊 */}
        <IdeaList />
      </div>
      <More
        isMore={isMore}
        onLoadMore={onLoadMore}
      />
    </div>
  );
};

export default Idea;
