import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { colors } from './index';

interface PopularPlan {
  title: string;
  author: string;
  avatar: string;
  description: string;
  likes: number;
  color: string;
}

const LearningPathList: FC = () => {
  const router = useRouter();
  
  // 熱門學習計畫資料
  const POPULAR_PLANS: PopularPlan[] = [
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
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">熱門學習路徑</h3>
        <button 
          className="text-base text-primary-base hover:text-primary-darker transition-colors"
          onClick={() => router.push('/learning-plan')}>
          查看全部
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {POPULAR_PLANS.map((plan, index) => (
          <div 
            key={index} 
            className="border rounded-lg p-4 hover:shadow-md transition-all bg-white cursor-pointer"
            onClick={() => router.push(`/learning-plan/${index}`)} // 假設有一個動態路由
          >
            <div className="flex">
              <div className="w-16 h-16 rounded-lg mr-4 bg-primary-palest flex items-center justify-center">
                <img 
                  src={plan.avatar} 
                  alt={plan.title} 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">{plan.title}</h4>
                <p className="text-sm text-gray-500 mb-2">由 {plan.author} 建立 • {plan.likes} 人喜歡</p>
                <div className="flex space-x-2">
                  <span className="text-sm px-2 py-0.5 rounded-full bg-primary-palest text-primary-base">
                    學習路徑
                  </span>
                  <span className="text-sm px-2 py-0.5 rounded-full" 
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
  );
};

export default LearningPathList;