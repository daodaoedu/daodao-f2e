import React, { FC } from 'react';
import { useRouter } from 'next/router';

interface IdeaPost {
  avatar: string;
  authorInitials: string;
  title: string;
  timestamp: string;
  excerpt: string;
  tag: string;
}

const IdeasList: FC = () => {
  const router = useRouter();
  
  const IDEAS: IdeaPost[] = [
    {
      avatar: "",
      authorInitials: "MK",
      title: "使用心智圖提升記憶力",
      timestamp: "2小時前",
      excerpt: "我發現創建視覺心智圖有助於回憶和理解複雜主題。這是我使用的技巧...",
      tag: "#學習技巧"
    },
    {
      avatar: "",
      authorInitials: "WL",
      title: "高效筆記方法分享",
      timestamp: "5小時前",
      excerpt: "經過多次嘗試，我找到了一種結合康奈爾筆記法和思維導圖的方式，效果顯著...",
      tag: "#筆記方法"
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">最新想法</h3>
        <button 
          className="text-base text-primary-base hover:text-primary-darker transition-colors"
          onClick={() => router.push('/ideas')}>
          查看全部
        </button>
      </div>
      
      {IDEAS.map((idea, index) => (
        <div 
          key={index} 
          className={`border rounded-lg p-4 hover:shadow-md transition-all bg-white cursor-pointer ${index > 0 ? 'mt-4' : ''}`}
          onClick={() => router.push(`/ideas/${index}`)} // 假設有一個動態路由
        >
          <div className="flex">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm bg-primary-palest text-primary-base">
              {idea.authorInitials}
            </div>
            <div>
              <div className="flex items-center mb-1">
                <span className="font-bold text-base mr-2">{idea.title}</span>
                <span className="text-sm text-gray-500">{idea.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {idea.excerpt}
              </p>
              <span className="text-sm px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {idea.tag}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IdeasList;