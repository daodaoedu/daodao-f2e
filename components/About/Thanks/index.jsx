import React from 'react';
import styled from '@emotion/styled';
// import { css } from "@emotion/react";
import { Box, Paper, Typography, Stack, Avatar } from '@mui/material';

const LineWrapper = styled(Typography)`
  margin: 5px 0;
`;

const SectionWrapper = styled.section`
  margin: 20px 0;
`;
const Thanks = () => {
  return (
    <SectionWrapper>
      <Typography
        variant="h2"
        sx={{
          margin: '40px 0 10px 0',
        }}
      >
        感謝名單
      </Typography>
      <Stack
        sx={{
          margin: '20px',
        }}
      >
        <LineWrapper variant="p" sx={{ fontWeight: '500' }}>
          「島島阿學－學習資源平台」是從一個人到一群人，並透過自學從無到有的過程。
          這一路上，感謝每一位曾經參與其中的夥伴，論是針對組織、平台給予建議，又或者協助新增資源，都讓我們由衷的感謝，島島阿學是在每一位橋樑互助共好下誕生的。
        </LineWrapper>
        <LineWrapper variant="p">
          臺灣實驗教育推動中心, 唐光華 老師, 丁志仁 老師, 曲智鑛 老師,
          g0v零時小學校, 柯君翰, 高婷柔, 向恩霈, 詹喬智, 米苔目, 王玠堯, Ael
        </LineWrapper>
      </Stack>
    </SectionWrapper>
  );
};

export default Thanks;
