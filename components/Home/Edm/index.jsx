import React from 'react';

function Edm() {
  return (
    <div className="w-[90%] mx-auto pt-10 pb-30 md:pt-10 md:pb-5">
      {/* 嵌入外部網頁的區域 */}
      <div className="w-full h-screen relative rounded-lg shadow-lg overflow-hidden">
        <iframe
          src="https://daoda.kit.com/newsletter"
          width="100%"
          height="100%"
          loading="lazy"
          title="News letter"
          scrolling="no"
          className="border-none absolute inset-0 overflow-hidden"
        />
      </div>
    </div>
  );
}

export default Edm;
