import React, { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import getManageLayout from '@/layout/ManageLayout';
import SEOConfig from '@/shared/components/SEO';
import Button from '@/shared/components/Button';
import BusinessCardList from '@/components/portfolio/BusinessCardList';
import { BusinessCardInfo, BusinessCardVariant } from '@/types/portfolio/BusinessCard';

// 示例卡片數據
const demoCards: BusinessCardInfo[] = [
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
    name: "林美玲",
    tagline: "視覺設計師 | 品牌策略專家",
    professionalAreas: ["Visual Design", "Branding", "UI/UX"],
    skills: ["Figma", "Photoshop", "Illustrator", "Brand Strategy"],
    contactInfo: {
      line: "mei_design",
      linkedin: "mei-design",
      email: "mei@example.com",
      telegram: "mei_design",
    },
    status: {
      isActive: true,
      label: "接受合作邀約",
    },
    ctaButtons: [
      {
        label: "查看作品集",
        action: "view_portfolio",
        url: "/portfolio",
      },
    ],
    recommendations: [
      {
        author: "張大為",
        content: "美玲的設計能力非常出色，她總是能夠準確把握客戶需求。",
        date: "2025-01-18",
      },
    ],
  },
  {
    name: "李志豪",
    tagline: "數據分析師 | 商業智能專家",
    professionalAreas: ["Data Analytics", "Business Intelligence", "Machine Learning"],
    skills: ["Python", "R", "SQL", "Power BI", "Tableau"],
    contactInfo: {
      line: "zhao_data",
      linkedin: "zhao-analytics",
      email: "zhao@example.com",
      telegram: "zhao_data",
    },
    status: {
      isActive: false,
      label: "短期不接案",
    },
    ctaButtons: [
      {
        label: "查看作品集",
        action: "view_portfolio",
        url: "/portfolio",
      },
      {
        label: "加入社群",
        action: "join_community",
        url: "/community",
      },
    ],
    recommendations: [],
  },
];

const BusinessCardShowcasePage = () => {
  const pathname = usePathname();
  const [selectedVariant, setSelectedVariant] = useState<BusinessCardVariant>('minimal');

  const SEOData = useMemo(() => ({
    title: '名片展示｜島島阿學',
    description: '瀏覽各種風格的專業名片，展示您的技能、經驗和聯繫方式。',
    keywords: '島島阿學, 個人名片, 專業技能, 作品集, 名片展示',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${pathname}`,
  }), [pathname]);

  // 處理卡片按鈕點擊
  const handleCardButtonClick = (action: string, url: string, card: BusinessCardInfo) => {
    toast.success(`${card.name} - ${action}`);
    // 在實際應用中，這裡可以根據不同的行動執行不同的操作
    console.log(`名片：${card.name}，動作：${action}，URL：${url}`);
  };

  return (
    <>
      <SEOConfig data={SEOData} />

      <div className="mb-6 p-2 flex items-center justify-between">
        <h2 className="heading-sm text-basic-500">名片展示</h2>
        <div className="flex gap-2">
          <Button
            variant={selectedVariant === 'minimal' ? 'solid' : 'outline'}
            color={selectedVariant === 'minimal' ? 'primary' : 'secondary'}
            onClick={() => setSelectedVariant('minimal')}
          >
            極簡風
          </Button>
          <Button
            variant={selectedVariant === 'creative' ? 'solid' : 'outline'}
            color={selectedVariant === 'creative' ? 'primary' : 'secondary'}
            onClick={() => setSelectedVariant('creative')}
          >
            創意風
          </Button>
          <Button
            variant={selectedVariant === 'business' ? 'solid' : 'outline'}
            color={selectedVariant === 'business' ? 'primary' : 'secondary'}
            onClick={() => setSelectedVariant('business')}
          >
            商務風
          </Button>
          <Button
            variant={selectedVariant === 'tech' ? 'solid' : 'outline'}
            color={selectedVariant === 'tech' ? 'primary' : 'secondary'}
            onClick={() => setSelectedVariant('tech')}
          >
            技術風
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg shadow-basic-200/40 p-6 mb-6">
        <BusinessCardList
          cards={demoCards}
          variant={selectedVariant}
          onCardButtonClick={handleCardButtonClick}
          className="p-4"
        />
      </div>
    </>
  );
};

BusinessCardShowcasePage.getLayout = (page: React.ReactElement) => getManageLayout(page);

export default BusinessCardShowcasePage;
