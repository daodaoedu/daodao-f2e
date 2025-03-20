import React, { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Partner {
  title: string;
  description: string;
  capacity: string;
  time: string;
}

const PartnersContent: FC = () => {
  const uniqueId = uuidv4();
  const partners: Partner[] = [
    {
      title: "英語學習小組",
      description: "每週三次線上會議，一起練習英語口說和聽力",
      capacity: "4/6",
      time: "每週二四六晚上8點"
    },
    {
      title: "程式設計學習夥伴",
      description: "尋找一起學習 Python 的夥伴，互相解題和分享學習資源",
      capacity: "1/2",
      time: "彈性安排"
    },
    {
      title: "學習讀書會",
      description: "每月選擇一本書籍，一起閱讀討論，分享心得",
      capacity: "5/10",
      time: "每月最後一個週六"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">學習夥伴</h1>
      <p className="text-lg text-gray-600 mb-8">尋找學習夥伴，互相督促，共同進步</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={uniqueId} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-3">{partner.title}</h2>
            <p className="text-gray-600 mb-4">{partner.description}</p>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <span className="mr-3">人數：{partner.capacity}</span>
              <span>時間：{partner.time}</span>
            </div>
            <button type="button" className="px-4 py-2 bg-primary-base text-white rounded-md hover:bg-primary-darker transition">申請加入</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartnersContent;
