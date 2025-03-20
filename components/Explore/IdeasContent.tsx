import React, { FC } from 'react';

interface Idea {
  title: string;
  content: string;
  author: string;
  date: string;
}

const IdeasContent: FC = () => {
  const ideas: Idea[] = [
    {
      title: "如何更有效地進行深度閱讀？",
      content: "我發現在閱讀專業書籍時經常走神，這是我嘗試的幾種提高專注力的方法...",
      author: "陳小明",
      date: "2023/12/10"
    },
    {
      title: "線上學習與實體課程的優缺點比較",
      content: "經過一年的線上課程和實體工作坊體驗，我總結了兩種學習方式的優缺點...",
      author: "林小華",
      date: "2023/11/28"
    },
    {
      title: "自學一門新技能的心路歷程",
      content: "從零開始學習前端開發，這是我遇到的挑戰和發現的資源...",
      author: "張大為",
      date: "2023/11/15"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">學習想法</h1>
      <p className="text-lg text-gray-600 mb-8">探索社群成員分享的各種學習想法與心得</p>

      <div className="space-y-6">
        {ideas.map((idea, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-3">{idea.title}</h2>
            <p className="text-gray-600 mb-4">{idea.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-3">分享者：{idea.author}</span>
              <span>{idea.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdeasContent;