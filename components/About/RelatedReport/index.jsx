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

const RelatedReport = () => {
  return (
    <SectionWrapper>
      <Typography
        variant="h2"
        sx={{
          margin: "40px 0 10px 0",
        }}
      >
        相關報導
      </Typography>
      <Stack
        sx={{
          margin: "20px",
        }}
      >
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={
              "https://www.ner.gov.tw/program/5a83f4eac5fd8a01e2df012b/602e2793b702e0000801cf6e"
            }
            rel="noopener noreferrer"
          >
            📌 國立教育廣播電台 – 生活 In
            Design：青年打造理想國：《島島阿學》用科技及創意輔助學生線上自學
          </LinkWrapper>
        </LineWrapper>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={
              "https://drive.google.com/file/d/1rDerbtnV0Abk2QWRyRB_RTRDyKsvn48e/view"
            }
            rel="noopener noreferrer"
          >
            📌 零時小學校2020成果手冊：學生老師共創學習資源平台
            島島阿學開啟共學新時代
          </LinkWrapper>
        </LineWrapper>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={"https://lab.ocf.tw/2020/11/17/sch001/"}
            rel="noopener noreferrer"
          >
            📌 OCF
            Lab開放實驗室：連結科技社群與教育界，透過開源解決方案弭平教育的數位落差
          </LinkWrapper>
        </LineWrapper>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={"https://edu100.parenting.com.tw/2021/detail/37#loaded"}
            rel="noopener noreferrer"
          >
            📌 親子天下教育創新 100
          </LinkWrapper>
        </LineWrapper>
      </Stack>
    </SectionWrapper>
  );
};

export default RelatedReport;
