import React from 'react';
import { getYear } from 'date-fns';

const SubFooter = () => {
  const year = getYear(new Date());
  return (
    <div className="bg-[#536166] text-white h-[50px] flex justify-center items-center text-base mt-5 tracking-[0.08em]">
      Tomorrow will be fine. 島島阿學 ©
      {' '}
      {year}
      .
    </div>
  );
};

export default SubFooter;
