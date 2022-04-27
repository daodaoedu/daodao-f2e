import React from "react";
import styled from "@emotion/styled";
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from "@mui/material";

const LinkWrapper = styled.a`
  color: black;
  &:hover {
    opacity: 100%;
    transition: color 0.5s ease;
    color: #16b9b3;
  }
`;

const SectionWrapper = styled.section`
  margin: 20px 0;
`;


const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const RealizeMore = () => {
  return (
    <SectionWrapper>
      <Typography
        variant="h2"
        sx={{
          margin: "40px 0 10px 0",
        }}
      >
        想了解更多嗎？
      </Typography>
      <Stack
        sx={{
          margin: "20px",
        }}
      >
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={"https://www.youtube.com/watch?v=7d8e-onHJfo&t=80s"}
            rel="noopener noreferrer"
          >
            🤔 島島阿學｜如何透過集體智慧解決自主學習困境，推動民主教育？
          </LinkWrapper>
        </LineWrapper>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={"https://www.behance.net/gallery/113709435/_"}
            rel="noopener noreferrer"
          >
            🏃 島島阿學發展歷程
          </LinkWrapper>
        </LineWrapper>
      </Stack>
    </SectionWrapper>
  );
};

export default RealizeMore;
