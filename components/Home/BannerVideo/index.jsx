import React from "react";
import styled from "@emotion/styled";

const BannerVideoWrapper = styled.div`
  position: absolute;
  background-color: #172f46;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: -1;
  top: 0;

  video {
    object-fit: cover;
    width: 100%;
    height: inherit;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(180px);
    z-index: 1;
  }
`;

const BackgroundFilterWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100vh;
  z-index: 1;
  top: 0;

  background-color: rgba(0, 0, 0, 0.75);
  opacity: 0.4;
  /* backdrop-filter: blur(10px); */
`;


const BannerVideo = () => {
  return (
    <BannerVideoWrapper>
      <video autoPlay muted loop playsInline preload="auto">
        <source src="/assets/daodao-banner.webm" type="video/webm" />
      </video>
      <BackgroundFilterWrapper />
    </BannerVideoWrapper>
  );
};

export default BannerVideo;
