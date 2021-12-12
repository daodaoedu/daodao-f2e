import React from "react";
import styled from "@emotion/styled";

const BannerVideoWrapper = styled.div`
  background-color: #f5f5f5;
  width: 100%;
  height: calc(100vh - 80px);
  overflow: hidden;

  video {
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: inherit;
  }
`;

const BannerVideo = () => {
  return (
    <BannerVideoWrapper>
      <video autoPlay muted loop playsInline preload="metadata">
        <source src="/assets/daodao-banner.mov" type="video/mp4" />
      </video>
    </BannerVideoWrapper>
  );
};

export default BannerVideo;
