"use client";

import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";

// 模擬數據 - 之後可以從 API 取得
const practiceTopics = [
  { id: 1, label: "《設計》線上課", templateId: "design-online-course" },
  { id: 2, label: "《角色設計》線上課", templateId: "character-design-course" },
  { id: 3, label: "電繪光影技巧", templateId: "digital-painting-lighting" },
  { id: 4, label: "冥想", templateId: "meditation" },
  { id: 5, label: "每天情緒日記", templateId: "daily-emotion-journal" },
  { id: 6, label: "Vibe coding", templateId: "vibe-coding" },
  { id: 7, label: "學習 Vibe coding", templateId: "learn-vibe-coding" },
  { id: 8, label: "一週一影評", templateId: "weekly-movie-review" },
  { id: 9, label: "化妝進階班", templateId: "makeup-advanced" },
  { id: 10, label: "徒手重訓", templateId: "bodyweight-training" },
  { id: 11, label: "睡前伸展操", templateId: "bedtime-stretching" },
  { id: 12, label: "動手做早餐", templateId: "make-breakfast" },
  { id: 13, label: "《設計》線上課", templateId: "design-online-course" },
  {
    id: 14,
    label: "《角色設計》線上課",
    templateId: "character-design-course",
  },
  { id: 15, label: "電繪光影技巧", templateId: "digital-painting-lighting" },
  { id: 16, label: "冥想", templateId: "meditation" },
  { id: 17, label: "每天情緒日記", templateId: "daily-emotion-journal" },
  { id: 18, label: "Vibe coding", templateId: "vibe-coding" },
  { id: 19, label: "學習 Vibe coding", templateId: "learn-vibe-coding" },
  { id: 20, label: "一週一影評", templateId: "weekly-movie-review" },
  { id: 21, label: "化妝進階班", templateId: "makeup-advanced" },
  { id: 22, label: "徒手重訓", templateId: "bodyweight-training" },
  { id: 23, label: "睡前伸展操", templateId: "bedtime-stretching" },
  { id: 24, label: "動手做早餐", templateId: "make-breakfast" },
];

interface PracticeTopicGridProps {
  onTopicClick?: (templateId: string) => void;
}

export const PracticeTopicGrid = ({ onTopicClick }: PracticeTopicGridProps) => {
  const handleTopicClick = (templateId: string) => {
    onTopicClick?.(templateId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, templateId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTopicClick(templateId);
    }
  };

  const renderTopicRow = (topics: typeof practiceTopics) => (
    <div className="animate-marquee hover:paused">
      <div className="flex w-max gap-2 will-change-transform">
        {topics.map((topic) => (
          <Badge
            key={topic.id}
            variant="outline-ghost"
            size="lg"
            role={onTopicClick ? "button" : undefined}
            tabIndex={onTopicClick ? 0 : undefined}
            onClick={() => handleTopicClick(topic.templateId)}
            onKeyDown={(e) => handleKeyDown(e, topic.templateId)}
            aria-label={onTopicClick ? `選擇模板：${topic.label}` : undefined}
            className={cn(
              "text-sm md:text-lg border-bg-gray text-light-gray",
              onTopicClick &&
                "cursor-pointer transition-all hover:border-logo-cyan hover:text-logo-cyan hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-logo-cyan focus-visible:outline-offset-2"
            )}
          >
            {topic.label}
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-3 md:space-y-4">
      {renderTopicRow(practiceTopics)}
      {renderTopicRow(practiceTopics)}
      {renderTopicRow(practiceTopics)}
    </div>
  );
};
