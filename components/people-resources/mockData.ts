import { BusinessCardInfo } from '@/types/portfolio/BusinessCard';

// 模擬從個人名片獲取的資料
export const mockBusinessCards: BusinessCardInfo[] = [
  {
    name: "王小明",
    tagline: "全端工程師 | AI 技術愛好者",
    professionalAreas: ["Web Development", "AI/ML", "UI/UX"],
    skills: ["React", "Node.js", "Python", "TensorFlow"],
    contactInfo: {
      line: "wang_dev",
      linkedin: "wang-dev",
      email: "wang@example.com",
      telegram: "wang_dev",
    },
    status: {
      isActive: true,
      label: "開放合作機會",
    },
    ctaButtons: [
      {
        label: "查看作品集",
        action: "view_portfolio",
        url: "/portfolio",
      },
      {
        label: "立即合作",
        action: "collaborate",
        url: "/contact",
      },
    ],
    recommendations: [
      {
        author: "陳小華",
        content: "小明在我們的AI專案中展現了優秀的技術能力和團隊合作精神。",
        date: "2025-02-15",
      },
    ],
  },
  {
    name: "李小花",
    tagline: "UI/UX 設計師 | 視覺創意總監",
    professionalAreas: ["UI/UX", "Visual Design", "Brand Identity"],
    skills: ["Figma", "Adobe XD", "Photoshop", "Illustrator"],
    contactInfo: {
      line: "leeflower",
      linkedin: "lee-flower",
      email: "lee@example.com",
      telegram: "lee_flower",
    },
    status: {
      isActive: true,
      label: "接受委託設計",
    },
    ctaButtons: [
      {
        label: "瀏覽作品",
        action: "view_portfolio",
        url: "/portfolio",
      },
      {
        label: "聯絡我",
        action: "contact",
        url: "/contact",
      },
    ],
    recommendations: [
      {
        author: "張大力",
        content: "小花的設計直覺非常好，能夠快速理解需求並提供創新的解決方案。",
        date: "2025-01-10",
      },
    ],
  },
  {
    name: "陳大山",
    tagline: "資料科學家 | 機器學習專家",
    professionalAreas: ["Data Science", "Machine Learning", "Statistical Analysis"],
    skills: ["Python", "R", "SQL", "TensorFlow", "PyTorch"],
    contactInfo: {
      line: "chen_data",
      linkedin: "chen-datascience",
      email: "chen@example.com",
      telegram: "chen_ml",
    },
    status: {
      isActive: false,
      label: "目前不接受新專案",
    },
    ctaButtons: [
      {
        label: "學術研究",
        action: "view_research",
        url: "/research",
      },
      {
        label: "演講邀約",
        action: "speaking",
        url: "/contact",
      },
    ],
    recommendations: [
      {
        author: "林小強",
        content: "大山的分析能力非常強，能夠從複雜的數據中提取有價值的見解。",
        date: "2024-12-05",
      },
    ],
  },
  {
    name: "張玉琪",
    tagline: "行銷策略專家 | 數位內容創作者",
    professionalAreas: ["Digital Marketing", "Content Creation", "Social Media"],
    skills: ["SEO", "SEM", "Content Strategy", "Analytics"],
    contactInfo: {
      line: "zhang_marketing",
      linkedin: "zhang-marketing",
      email: "zhang@example.com",
      telegram: "zhang_digital",
    },
    status: {
      isActive: true,
      label: "可合作專案",
    },
    ctaButtons: [
      {
        label: "成功案例",
        action: "view_cases",
        url: "/cases",
      },
      {
        label: "預約諮詢",
        action: "consultation",
        url: "/booking",
      },
    ],
    recommendations: [
      {
        author: "孫小美",
        content: "玉琪的行銷策略非常有效，幫助我們的品牌在短時間內提高了知名度。",
        date: "2025-02-20",
      },
    ],
  },
  {
    name: "林書豪",
    tagline: "產品經理 | 敏捷教練",
    professionalAreas: ["Product Management", "Agile", "Team Leadership"],
    skills: ["Scrum", "Kanban", "User Stories", "Roadmapping"],
    contactInfo: {
      line: "lin_product",
      linkedin: "lin-product",
      email: "lin@example.com",
      telegram: "lin_agile",
    },
    status: {
      isActive: true,
      label: "尋找新機會",
    },
    ctaButtons: [
      {
        label: "專案作品",
        action: "view_projects",
        url: "/projects",
      },
      {
        label: "職涯機會",
        action: "opportunities",
        url: "/contact",
      },
    ],
    recommendations: [
      {
        author: "趙大為",
        content: "書豪是一個優秀的產品經理，能夠平衡用戶需求和業務目標。",
        date: "2025-01-30",
      },
    ],
  },
];

// 從資料中提取篩選選項
export const getFilterOptions = () => {
  const skillOptions = Array.from(
    new Set(mockBusinessCards.flatMap((card) => card.skills))
  ).sort();

  const areaOptions = Array.from(
    new Set(mockBusinessCards.flatMap((card) => card.professionalAreas))
  ).sort();

  const statusOptions = ["全部", "開放合作", "不可用"];

  return {
    skillOptions,
    areaOptions,
    statusOptions
  };
};
