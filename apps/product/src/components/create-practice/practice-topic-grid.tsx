"use client";

import { Badge } from "@daodao/ui/components/badge";

// 模擬數據 - 之後可以從 API 取得
const practiceTopics = [
  { id: 1, label: "《設計》線上課" },
  { id: 2, label: "《角色設計》線上課" },
  { id: 3, label: "電繪光影技巧" },
  { id: 4, label: "冥想" },
  { id: 5, label: "每天情緒日記" },
  { id: 6, label: "Vibe coding" },
  { id: 7, label: "學習 Vibe coding" },
  { id: 8, label: "一週一影評" },
  { id: 9, label: "化妝進階班" },
  { id: 10, label: "徒手重訓" },
  { id: 11, label: "睡前伸展操" },
  { id: 12, label: "動手做早餐" },
  { id: 13, label: "《設計》線上課" },
  { id: 14, label: "《角色設計》線上課" },
  { id: 15, label: "電繪光影技巧" },
  { id: 16, label: "冥想" },
  { id: 17, label: "每天情緒日記" },
  { id: 18, label: "Vibe coding" },
  { id: 19, label: "學習 Vibe coding" },
  { id: 20, label: "一週一影評" },
  { id: 21, label: "化妝進階班" },
  { id: 22, label: "徒手重訓" },
  { id: 23, label: "睡前伸展操" },
  { id: 24, label: "動手做早餐" },
];

export const PracticeTopicGrid = () => {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="animate-marquee hover:paused">
        <div className="flex w-max gap-2 will-change-transform">
          {practiceTopics.map((topic) => (
            <Badge
              key={topic.id}
              variant="outline-ghost"
              size="lg"
              className="text-sm md:text-lg border-bg-gray text-light-gray"
            >
              {topic.label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="animate-marquee hover:paused">
        <div className="flex w-max gap-2 will-change-transform">
          {practiceTopics.map((topic) => (
            <Badge
              key={topic.id}
              variant="outline-ghost"
              size="lg"
              className="text-sm md:text-lg border-bg-gray text-light-gray"
            >
              {topic.label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="animate-marquee hover:paused">
        <div className="flex w-max gap-2 will-change-transform">
          {practiceTopics.map((topic) => (
            <Badge
              key={topic.id}
              variant="outline-ghost"
              size="lg"
              className="text-sm md:text-lg border-bg-gray text-light-gray"
            >
              {topic.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
