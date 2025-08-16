import React from 'react';

const BannerVideo = () => (
  <div className="absolute bg-[#172f46] w-full h-screen overflow-hidden z-[-1] top-0">
    <video className="object-cover w-full h-full bg-black/75 backdrop-blur-[180px] z-[1]" autoPlay muted loop playsInline preload="auto">
      <source src="/assets/daodao-banner.webm" type="video/webm" />
    </video>
    <div className="absolute w-full h-screen z-[1] top-0 bg-black/75 opacity-40" />
  </div>
);

export default BannerVideo;
