import { Option } from "@/components/ui/multiple-selector";

export const resourceTypes: Option[] = [
  { value: "learning-platform", label: "學習平台/APP" },
  { value: "learning-tool", label: "學習工具" },
  { value: "book", label: "書籍/文章" },
  { value: "video", label: "影片" },
  { value: "podcast", label: "Podcast" },
  { value: "workshop", label: "工作坊與課程" },
  { value: "certificate", label: "專業證書與認證課程" },
  { value: "online-course", label: "如 Coursera、Udemy、edX" },
];

export const costTypes: Option[] = [
  { value: "free", label: "免費" },
  { value: "partially-free", label: "部分免費" },
  { value: "paid", label: "付費" },
];

export const targetAudienceTypes: Option[] = [
  { value: "beginner", label: "初學" },
  { value: "intermediate", label: "進階" },
  { value: "expert", label: "專家" },
];

export const contentFeaturesOptions: Option[] = [
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

export const timeUsageOptions: Option[] = [
  { value: "daily", label: "每天學習 1-2 小時" },
  { value: "weekly", label: "每週集中學習幾天" },
  { value: "fragmented", label: "利用碎片時間學習" },
  { value: "notApplicable", label: "不適用" },
];

export const resourceUsageOptions: Option[] = [
  { value: "withOnlineCourses", label: "是，搭配線上課程" },
  { value: "withBooks", label: "是，搭配相關書籍" },
  { value: "withOtherTools", label: "是，搭配相關工具" },
  { value: "withCommunity", label: "是，參與了社群或討論" },
  { value: "onlyThisResource", label: "否，僅使用該資源" },
  { value: "notApplicableResource", label: "不適用" },
];
