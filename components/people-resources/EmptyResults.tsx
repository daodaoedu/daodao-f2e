import React from 'react';
import Button from '@/shared/components/Button';

interface EmptyResultsProps {
  onResetFilters: () => void;
}

const EmptyResults: React.FC<EmptyResultsProps> = ({ onResetFilters }) => {
  return (
    <div className="py-12 text-center">
      <p className="text-gray-500">沒有找到符合條件的人脈資源</p>
      <Button
        variant="outline"
        color="primary"
        onClick={onResetFilters}
        className="mt-2"
      >
        重置所有篩選條件
      </Button>
    </div>
  );
};

export default EmptyResults;
