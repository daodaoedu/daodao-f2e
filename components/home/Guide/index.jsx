import React from "react";
import styled from "@emotion/styled";
import Box from "@mui/material/Box";
import CardList from "./CardList";

const GuideWrapper = styled.div`
  width: 90%;
  height: calc(var(--section-height) + var(--section-height-offset));
  margin: 0 auto;
  padding-top: 80px;
  padding-bottom: 80px;
  h2 {
    color: #536166;
    font-weight: bold;
    font-size: 40px;
    line-height: 50px;
    letter-spacing: 0.08em;
  }
`;

const Guide = () => {
  return (
    <GuideWrapper>
      <h2>大家正在學...</h2>
      <Box sx={{ marginTop: "50px" }}>
        <CardList />
      </Box>
    </GuideWrapper>
  );
};

export default Guide;
