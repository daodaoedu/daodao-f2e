import React from 'react';
import Button from '@/shared/components/Button';
import { BusinessCardVariant } from '@/types/portfolio/BusinessCard';

interface CardStyleSelectorProps {
  selectedVariant: BusinessCardVariant;
  setSelectedVariant: (variant: BusinessCardVariant) => void;
  filteredCardsCount: number;
}

const CardStyleSelector: React.FC<CardStyleSelectorProps> = ({
  selectedVariant,
  setSelectedVariant,
  filteredCardsCount
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">共 {filteredCardsCount} 位人脈</h3>
        <div className="flex gap-2">
          <Button
            variant={selectedVariant === 'minimal' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setSelectedVariant('minimal')}
          >
            極簡風
          </Button>
          <Button
            variant={selectedVariant === 'business' ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setSelectedVariant('business')}
          >
            商務風
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardStyleSelector;
