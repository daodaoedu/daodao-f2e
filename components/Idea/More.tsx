import React from 'react';
import { Button } from '@/components/ui/button';

interface MoreProps {
  isMore: boolean;
  onLoadMore: () => void;
}

const More: React.FC<MoreProps> = ({ isMore, onLoadMore }) => {
  return (
    <div className="text-center pt-20 pb-24">
      {isMore && (
        <Button
          variant="outline"
          className="text-[16px] text-[#536166] border border-[#16B9B3] rounded-[20px] py-[6px] px-[48px] disabled:opacity-50"
          onClick={onLoadMore}
        >
          顯示更多
        </Button>
      )}
    </div>
  );
};

export default More;
