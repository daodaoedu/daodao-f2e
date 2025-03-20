import React from 'react';
import { BusinessCardInfo, BusinessCardVariant } from '@/types/portfolio/BusinessCard';
import BusinessCard from './BusinessCard';

interface BusinessCardListProps {
  cards: BusinessCardInfo[];
  variant?: BusinessCardVariant;
  cardClassName?: string;
  onCardButtonClick?: (action: string, url: string, cardInfo: BusinessCardInfo) => void;
  className?: string;
}

const BusinessCardList: React.FC<BusinessCardListProps> = ({
  cards,
  variant = 'minimal',
  cardClassName,
  onCardButtonClick,
  className = ''
}) => {
  // 處理按鈕點擊，傳遞額外的卡片資訊
  const handleButtonClick = (action: string, url: string, cardInfo: BusinessCardInfo) => {
    if (onCardButtonClick) {
      onCardButtonClick(action, url, cardInfo);
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {cards.map((card) => (
        <div key={`card-${card.name}`} className="flex justify-center">
          <BusinessCard
            info={card}
            variant={variant}
            className={cardClassName}
            onButtonClick={(action, url) => handleButtonClick(action, url, card)}
          />
        </div>
      ))}
    </div>
  );
};

export default BusinessCardList;
