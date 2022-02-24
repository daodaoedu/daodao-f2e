import React from "react";
import styled from "@emotion/styled";
import { Box, Paper, Typography } from "@mui/material";

const ResourceWrapper = styled.section`
  padding-top: 40px;
  padding-bottom: 40px;
  .title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 10px 0 0;
    color: black;
    &:hover {
      cursor: pointer;
      color: #37b9eb;
      transition: 0.5s;
    }
  }
  @media (max-width: 767px) {
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const ContributeResource = () => {
  return (
    <ResourceWrapper>
      <Paper
        sx={{
          width: "80%",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              margin: "10px 0",
            }}
          >
            新增資源
          </Typography>
          <Typography variant="p">
            我們期盼能邀請在各領域深耕已久的夥伴，
            將自身累積的資源新增至教育資源網站，讓資源透明化。
            若您願意一同共編，以下為新增資源的表單，您新增完後我們將進行審核在新增至上方資料庫中：
          </Typography>
        </Box>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            多元學習資源
          </Typography>
          <Typography variant="p">
            多元學習資源整合各領域各類型資源，此資源需具有學習意義（涵蓋素養教育中認知、情意、技能其中一項即可），此外不得放腥羶色、暴力、違反人權的資源。而資源類型包含網站、影片、組織、APP、Podcast、書、沒有時效性的線上課程及活動、學習社群（例如：Facebook社團、LINE社群、Instagram帳號、粉絲專頁）、每年固定都有或是沒有時效性的提案／競賽。
          </Typography>
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
