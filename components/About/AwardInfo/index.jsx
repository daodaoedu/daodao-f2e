import React from 'react';
import styled from '@emotion/styled';
import { Typography, Stack } from '@mui/material';

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

const AwardInfo = () => (
  <SectionWrapper>
    <Typography
      variant="h2"
      sx={{
        margin: '40px 0 10px 0',
      }}
    >
      獲獎資訊
    </Typography>
    <Stack
      sx={{
        margin: '20px',
      }}
    >
      <LineWrapper variant="p">
        <LinkWrapper
          target="_blank"
          href="https://lab.ocf.tw/2020/11/17/sch001/"
          rel="noopener noreferrer"
        >
          📌 g0v零時小學校 demo day - 前五名
        </LinkWrapper>
      </LineWrapper>
      <LineWrapper variant="p">
        <LinkWrapper
          target="_blank"
          href="https://edu100.parenting.com.tw/2021/detail/37#loaded"
          rel="noopener noreferrer"
        >
          📌 親子天下教育創新 100 - 入選
        </LinkWrapper>
      </LineWrapper>
    </Stack>
  </SectionWrapper>
);

export default AwardInfo;
