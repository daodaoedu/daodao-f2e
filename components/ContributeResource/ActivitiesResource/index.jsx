import React from "react";
import styled from "@emotion/styled";
import { Box, Paper, Typography } from "@mui/material";

const ActivitiesResource = () => {
  return (
    <Box>
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
          二、島島活動消息
        </Typography>
        <Typography variant="p">
          島島活動消息以學習相關活動為主，期盼整合「具有學習意義、提倡以學習者為中心、不違反人權、不包含血腥及暴力」等活動、課程、計畫、競賽、提案。
        </Typography>
      </Box>
      <Box
        sx={{
          margin: "40px 0 20px 0",
        }}
      >
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSeMg55q91VIdvNOmqqkzhqJGCKG4106YM0cVidzX6wHS9AJIA/viewform?embedded=true"
          width="100%"
          height="2500"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        >
          載入中 . . .
        </iframe>
      </Box>
    </Box>
  );
};

export default ActivitiesResource;
