import React from "react";
import styled from "@emotion/styled";

const BannerVideoWrapper = styled.div`
  position: absolute;
  background-color: #172f46;
  width: 100%;
  height: calc(100vh);
  overflow: hidden;
  z-index: -1;
  top: 0;

  video {
    object-fit: cover;
    width: 100%;
    height: inherit;
  }
`;

const BannerVideo = () => {
  return (
    <BannerVideoWrapper>
      <video autoPlay muted loop playsInline preload="auto">
        <source src="/assets/daodao-banner.mov" type="video/mp4" />
      </video>
    </BannerVideoWrapper>
  );
};

export default BannerVideo;
