import React from "react";
import styled from "@emotion/styled";
import { Paper, Box, Typography } from "@mui/material";
import LearningResource from "./LearningResource";
import ActivitiesResource from "./ActivitiesResource";
import LocationResource from "./LocationResource";
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
        <LearningResource />
        <ActivitiesResource />
        <LocationResource />
        <Box
          sx={{
            margin: "50px 0",
          }}
        >
          <Typography variant="p">謝謝你成為彼此自學路上的橋樑。</Typography>
          <Typography variant="p">
            若有任何問題，歡迎與我們聯繫唷！謝謝！ Email：contact@daoedu.tw
          </Typography>
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
