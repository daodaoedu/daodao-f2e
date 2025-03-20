import React, { FC } from 'react';

interface Resource {
  title: string;
  description: string;
  type: string;
  language: string;
}

const ResourcesContent: FC = () => {
  const resources: Resource[] = [
    {
      title: "Coursera 線上課程平台",
      description: "提供世界頂尖大學和機構的線上課程",
      type: "線上課程",
      language: "多語言"
    },
    {
      title: "Khan Academy 教學影片",
      description: "免費教育資源，涵蓋數學、科學等多個領域",
      type: "影片教學",
      language: "英文"
    },
    {
      title: "學習資源工具包",
      description: "整合各類學習工具和資源的工具包",
      type: "綜合工具",
      language: "中文"
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">學習資源</h1>
      <p className="text-lg text-gray-600 mb-8">探索各類學習資源，助你更有效地學習</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{resource.title}</h2>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-3">類型：{resource.type}</span>
                <span>語言：{resource.language}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesContent;