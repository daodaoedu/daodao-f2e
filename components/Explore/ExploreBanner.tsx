import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { colors } from './index';

const ExploreBanner: FC = () => {
  const router = useRouter();

  return (
    <div className="p-6 rounded-lg text-white mb-6" 
      style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.dark})` }}>
      <h3 className="text-2xl font-bold mb-2">探索學習路徑</h3>
      <p className="mb-4 text-base">發掘由我們社群創建的精選學習體驗</p>
      <div className="flex space-x-3">
        <button 
          onClick={() => router.push('/learning-plan/create')}
          className="px-4 py-2 rounded-md bg-white text-primary-base hover:bg-gray-100 transition-colors">
          開始一個路徑
        </button>
        <button 
          onClick={() => router.push('/learning-plan')}
          className="px-4 py-2 rounded-md border border-white text-white hover:bg-white/10 transition-colors">
          瀏覽路徑
        </button>
      </div>
    </div>
  );
};

export default ExploreBanner;