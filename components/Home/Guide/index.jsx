import React from 'react';
import CardList from './CardList';

const Guide = () => (
  <div className="w-[90%] mx-auto pt-10 pb-10 max-md:pt-10 max-md:pb-5">
    <h2 className="text-[#536166] font-bold text-[26px] leading-[50px] tracking-[0.08em]">
      大家正在學...
    </h2>
    <div className="mt-5">
      <CardList />
    </div>
  </div>
);

export default Guide;
