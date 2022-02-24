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
            島島教育場域
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="h2"
            sx={{
              margin: "40px 0 10px 0",
            }}
          >
            ⬇ 點擊此按鈕能看到篩選工具
          </Typography>
          <iframe
            src="https://www.google.com/maps/d/embed?mid=1I2UZp4qujWgrb9tbztjdkBIDW0Gy3h6V&ehbc=2E312F"
            width="100%"
            height="880"
          ></iframe>
        </Box>
      </Paper>
    </ResourceWrapper>
  );
};

export default ContributeResource;
