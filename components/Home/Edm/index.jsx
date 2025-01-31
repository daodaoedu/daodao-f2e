import React from 'react';

function Edm() {
  return (
    <div className="w-[90%] mx-auto pt-10 pb-30 md:pt-10 md:pb-5">
      {/* 嵌入外部網頁的區域 */}
      <div className="w-full h-screen relative rounded-lg shadow-lg">
        <iframe
          src="https://daoda.kit.com/newsletter"
          width="100%"
          height="100%"
          title="Embedded Page"
          allowFullScreen
          className="border-none absolute inset-0 "
        />
      </div>
    </div>
  );
}

export default Edm;
