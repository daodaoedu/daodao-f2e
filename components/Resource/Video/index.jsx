import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import ReactPlayer from "react-player/youtube";

const VideoWrapper = styled.div`
  --video-width: calc(80vw - 20px);
  margin: 20px 0;
  h2 {
    font-size: 20px;
    font-weight: 500;
  }
  p {
    margin-top: 15px;
  }
`;

const ReactPlayerWrapper = styled(ReactPlayer)`
  margin: 20px auto;
  max-width: 640px;
  max-height: 360px;
`;

const Video = ({ videoLink }) => {
    if (videoLink) {
      return (
        <VideoWrapper>
          <h2>🕹 影片介紹</h2>
          <Box sx={{ width: "var(--video-width)" }}>
            <ReactPlayerWrapper
              url={videoLink}
              controls
              width="var(--video-width)"
              height="calc(var(--video-width) * 0.5625)"
            />
          </Box>
        </VideoWrapper>
      );
    }
    return <></>;
};

export default Video;

