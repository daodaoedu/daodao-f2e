import React from 'react';
import Typed from 'react-typed';

const Title = () => (
  <div className="min-h-[70px] max-md:min-h-[130px]">
    <h1 className="text-2xl leading-7 tracking-[0.08em] text-[#f0f0f0] font-medium text-center">
      <Typed
        strings={['歡迎來到島島阿學！一起尋找資源與分享資源吧！']}
        typeSpeed={80}
      />
    </h1>
    <h2 className="text-base leading-[22px] tracking-[0.08em] text-center mt-2.5 text-[#f0f0f0] font-medium">
      <Typed
        strings={[
          'If you want to go fast go alone. If you want to go far go together.',
        ]}
        typeSpeed={80}
      />
    </h2>
  </div>
);

export default Title;
