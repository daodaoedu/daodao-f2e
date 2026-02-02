import { createOptionMap } from "@/shared/lib/option";
import type { OptionProps } from "@/shared/ui/option";

interface OptionWithDescriptionProps extends OptionProps {
  description: string;
}

export const resourceTypeOptions: OptionWithDescriptionProps[] = [
  {
    value: "learning_platform_app",
    label: "學習平台/APP",
    description: "如 Coursera、Udemy、edX",
  },
  {
    value: "learning_tools",
    label: "學習工具",
    description: "如 Google 翻譯、Notion、Grammarly",
  },
  {
    value: "books_articles",
    label: "書籍/文章",
    description: "如 《原子習慣》、哈佛商業評論文章",
  },
  {
    value: "video_content",
    label: "影片",
    description: "如 YouTube 教育頻道「CrashCourse」、TED Talks 演講",
  },
  {
    value: "podcast_content",
    label: "Podcast",
    description: "如 《有聲書評》、《經濟學人》Podcast",
  },
  {
    value: "workshops_courses",
    label: "工作坊與課程",
    description: "如 Design Thinking 工作坊、本地社區的公開學習活動",
  },
  {
    value: "professional_certificates",
    label: "專業證書與認證課程",
    description: "如 AWS Certification、PMP 課程",
  },
  {
    value: "community_organization",
    label: "社群/組織",
    description: "如 Meetup 的技術社群、LinkedIn 的專業小組",
  },
];

export const costTypeOptions: OptionProps[] = [
  { value: "free", label: "免費" },
  { value: "partial_free", label: "部分免費" },
  { value: "paid", label: "付費" },
];

export const targetAudienceTypeOptions: OptionWithDescriptionProps[] = [
  {
    value: "beginner",
    label: "初學",
    description: "剛開始學習某個領域的人，正在打基礎，掌握基本概念和技能。",
  },
  {
    value: "intermediate",
    label: "進階",
    description: "已有一定基礎，能獨立處理較複雜的問題，正在深化專業知識。",
  },
  {
    value: "expert",
    label: "專家",
    description: "在該領域有豐富經驗和深厚知識，能解決困難問題，並能指導他人。",
  },
];

export const contentFeaturesOptions: OptionProps[] = [
  { value: "wellStructured", label: "結構清晰" },
  { value: "practiceFocused", label: "實用導向" },
  { value: "wellRoundedConcepts", label: "觀念完整" },
  { value: "thoughtProvoking", label: "靈感啟發" },
  { value: "progressiveLearning", label: "循序漸進" },
  { value: "problemBased", label: "問題導向" },
  { value: "realWorldExamples", label: "具體案例" },
  { value: "interactive", label: "具互動性" },
  { value: "visuallyRich", label: "圖文並茂" },
];

export const timeUsageOptions: OptionProps[] = [
  { value: "daily", label: "每天學習 1-2 小時" },
  { value: "weekly", label: "每週集中學習幾天" },
  { value: "fragmented", label: "利用碎片時間學習" },
  { value: "notApplicable", label: "不適用" },
];

export const resourceUsageOptions: OptionProps[] = [
  { value: "withOnlineCourses", label: "是，搭配線上課程" },
  { value: "withBooks", label: "是，搭配相關書籍" },
  { value: "withOtherTools", label: "是，搭配相關工具" },
  { value: "withCommunity", label: "是，參與了社群或討論" },
  { value: "onlyThisResource", label: "否，僅使用該資源" },
  { value: "notApplicableResource", label: "不適用" },
];

export const resourceTypeMap = createOptionMap(resourceTypeOptions);
export const costTypeMap = createOptionMap(costTypeOptions);
export const targetAudienceTypeMap = createOptionMap(targetAudienceTypeOptions);
export const contentFeaturesMap = createOptionMap(contentFeaturesOptions);
export const timeUsageMap = createOptionMap(timeUsageOptions);
export const resourceUsageMap = createOptionMap(resourceUsageOptions);
