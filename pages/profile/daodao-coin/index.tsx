import React from 'react';
import DaodaoCoin from '@/components/Profile/DaodaoCoin';
import getDefaultLayout from '@/layout/DefaultLayout';

const DaodaoCoinPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <DaodaoCoin />
      </div>
    </div>
  );
};

DaodaoCoinPage.getLayout = getDefaultLayout;

export default DaodaoCoinPage;
