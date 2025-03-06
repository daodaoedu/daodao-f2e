import React from 'react';

interface MoreProps {
  isMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

const More: React.FC<MoreProps> = ({ isMore, isLoading, onLoadMore }) => {
  return (
    <div className="text-center pt-20 pb-24">
      {isMore && (
        <button
          className="text-[16px] text-[#536166] border border-[#16B9B3] rounded-[20px] py-[6px] px-[48px] disabled:opacity-50"
          disabled={isLoading}
          onClick={onLoadMore}
        >
          顯示更多
        </button>
      )}
    </div>
  );
};

export default More;