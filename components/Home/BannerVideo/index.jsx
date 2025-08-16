import React from 'react';

const BannerVideo = () => (
  <div className="absolute top-0 z-[-1] h-screen w-full overflow-hidden bg-[#172f46]">
    <video className="z-[1] h-full w-full bg-black/75 object-cover backdrop-blur-[180px]" autoPlay muted loop playsInline preload="auto">
      <source src="/assets/daodao-banner.webm" type="video/webm" />
    </video>
    <div className="absolute top-0 z-[1] h-screen w-full bg-black/75 opacity-40" />
  </div>
);

export default BannerVideo;
