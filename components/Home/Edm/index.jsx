import React from 'react';

function Edm() {
  return (
    <div className="pb-30 mx-auto w-[90%] pt-10 md:pb-5 md:pt-10">
      {/* 嵌入外部網頁的區域 */}
      <div className="relative h-screen w-full overflow-hidden rounded-lg shadow-lg">
        <iframe
          src="https://daoda.kit.com/newsletter"
          width="100%"
          height="100%"
          loading="lazy"
          title="News letter"
          scrolling="no"
          className="absolute inset-0 overflow-hidden border-none"
        />
      </div>
    </div>
  );
}

export default Edm;
