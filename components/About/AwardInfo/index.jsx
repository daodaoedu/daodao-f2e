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

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const AwardInfo = () => {
  return (
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
        獲獎資訊
      </Typography>
      <Stack
        sx={{
          margin: "20px",
        }}
      >
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={"https://lab.ocf.tw/2020/11/17/sch001/"}
            rel="noopener noreferrer"
          >
            📌 g0v零時小學校 demo day - 前五名
          </LinkWrapper>
        </LineWrapper>
        <LineWrapper variant="p">
          <LinkWrapper
            target="_blank"
            href={"https://edu100.parenting.com.tw/2021/detail/37#loaded"}
            rel="noopener noreferrer"
          >
            📌 親子天下教育創新100 - 入選
          </LinkWrapper>
        </LineWrapper>
      </Stack>
    </Box>
  );
};

export default AwardInfo;
