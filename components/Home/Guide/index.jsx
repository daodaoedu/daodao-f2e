import React from 'react';
import CardList from './CardList';

const Guide = () => (
  <div className="mx-auto w-[90%] pb-10 pt-10 max-md:pb-5 max-md:pt-10">
    <h2 className="text-[26px] font-bold leading-[50px] tracking-[0.08em] text-[#536166]">
      大家正在學...
    </h2>
    <div className="mt-5">
      <CardList />
    </div>
  </div>
);

export default Guide;
