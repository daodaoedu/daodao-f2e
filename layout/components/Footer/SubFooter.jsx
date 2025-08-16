import React from 'react';
import { getYear } from 'date-fns';

const SubFooter = () => {
  const year = getYear(new Date());
  return (
    <div className="mt-5 flex h-[50px] items-center justify-center bg-[#536166] text-base tracking-[0.08em] text-white">
      Tomorrow will be fine. 島島阿學 ©
      {' '}
      {year}
      .
    </div>
  );
};

export default SubFooter;
