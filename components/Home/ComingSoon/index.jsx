import React, { useState } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { useRouter } from 'next/router';

const GuideWrapper = styled.div`
  margin: 0 auto;
  padding-top: 80px;
  padding-bottom: 80px;
  .guide-title {
    color: #536166;
    font-weight: bold;
    font-size: 40px;
    line-height: 50px;
    letter-spacing: 0.08em;
    margin-left: '20px';
  }

  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

function ComingSoon() {
  return (
    <GuideWrapper>
      <Typography
        variant="h2"
        sx={{
          color: '#536166',
          fontWeight: 'bold',
          fontSize: '36px',
          lineHeight: '50px',
          letterSpacing: '0.08em',
          textAlign: 'left',
          marginLeft: 'calc(5% + 20px)',
        }}
      >
        即將登場 - 小幫手APP
      </Typography>
      <Box
        component="img"
        src="/assets/extension-banner.png"
        sx={{
          display: 'block',
          height: '300px',
          margin: '20px auto 0 auto',
          '@media (max-width: 767px)': {
            width: '100vw',
            height: 'auto',
            marginTop: '20px',
          },
        }}
      />
    </GuideWrapper>
  );
}

export default ComingSoon;
