import React, { useMemo } from 'react';
import { cn } from '@/utils/cn';

// 定義類型
export interface BusinessCardInfo {
  name: string;
  tagline: string;
  professionalAreas: string[];
  skills: string[];
  contactInfo: {
    line: string;
    linkedin: string;
    email: string;
    telegram: string;
  };
  status: {
    isActive: boolean;
    label: string;
  };
  ctaButtons: Array<{
    label: string;
    action: string;
    url: string;
  }>;
  recommendations: Array<{
    author: string;
    content: string;
    date: string;
  }>;
}

export type BusinessCardVariant = 'minimal' | 'creative' | 'business' | 'tech';

interface BusinessCardProps {
  info: BusinessCardInfo;
  variant: BusinessCardVariant;
  className?: string;
  onButtonClick?: (action: string, url: string) => void;
  isPreview?: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  info,
  variant,
  className,
  onButtonClick,
  isPreview = false
}) => {
  // 使用 useMemo 緩存樣式計算，提高性能
  const cardStyle = useMemo(() => {
    return cn(
      "w-full max-w-md p-6 rounded-xl shadow-lg",
      variant === 'minimal' && "bg-white border border-gray-200",
      variant === 'creative' && "bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200",
      variant === 'business' && "bg-blue-50 border border-blue-200",
      variant === 'tech' && "bg-gray-100 border border-gray-300",
      className
    );
  }, [variant, className]);

  // 處理按鈕點擊
  const handleButtonClick = (action: string, url: string) => {
    if (onButtonClick) {
      onButtonClick(action, url);
    } else if (!isPreview) {
      // 若非預覽模式且沒有提供自定義點擊處理，則執行預設行為
      window.open(url, '_blank');
    }
  };

  return (
    <div className={cardStyle}>
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{info.name}</h2>
        <p className="text-gray-600">{info.tagline}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">專業領域</h3>
        <div className="flex flex-wrap gap-2">
          {info.professionalAreas.map((area) => (
            <span key={`area-${area}`} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {area}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">技能</h3>
        <div className="flex flex-wrap gap-2">
          {info.skills.map((skill) => (
            <span key={`skill-${skill}`} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">聯絡方式</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-xs">Email: {info.contactInfo.email}</div>
          <div className="text-xs">LinkedIn: {info.contactInfo.linkedin}</div>
          <div className="text-xs">Line: {info.contactInfo.line}</div>
          <div className="text-xs">Telegram: {info.contactInfo.telegram}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className={cn(
          "px-2 py-1 rounded-full text-xs",
          info.status.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        )}
        >
          {info.status.label}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {info.ctaButtons.map((button) => (
          <button
            type="button"
            key={`btn-${button.action}-${button.label}`}
            className={cn(
              "w-full py-2 px-4 rounded-md text-white text-center",
              variant === 'minimal' && "bg-blue-500 hover:bg-blue-600",
              variant === 'creative' && "bg-purple-500 hover:bg-purple-600",
              variant === 'business' && "bg-blue-700 hover:bg-blue-800",
              variant === 'tech' && "bg-gray-700 hover:bg-gray-800"
            )}
            onClick={() => handleButtonClick(button.action, button.url)}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BusinessCard;
