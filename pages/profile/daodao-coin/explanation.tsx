import React from 'react';
import CoinExplanation from '@/components/Profile/DaodaoCoin/CoinExplanation';
import getDefaultLayout from '@/layout/DefaultLayout';

const CoinExplanationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <CoinExplanation />
      </div>
    </div>
  );
};

CoinExplanationPage.getLayout = getDefaultLayout;

export default CoinExplanationPage;
