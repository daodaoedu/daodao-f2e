import React, { useState } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { Typography, Button } from '@mui/material';

const GuideWrapper = styled.div`
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 40px;
  .guide-title {
    color: #536166;
    font-weight: bold;
    font-size: 40px;
    line-height: 50px;
    letter-spacing: 0.08em;
    margin-left: 20px;
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
          fontSize: '26px',
          lineHeight: '50px',
          letterSpacing: '0.08em',
          textAlign: 'left',
          marginLeft: 'calc(5% + 20px)',
          '@media (max-width: 767px)': {
            margin: '0 5%',
          },
        }}
      >
        新增多元學習資源小幫手
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
      <Box
        sx={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          margin: '12px 0 12px calc(5% + 20px)',
          '@media(max-width: 767px)': {
            margin: '12px 5% 12px 5%',
            flexDirection: 'column',
          },
        }}
      >
        <Typography>
          為了鼓勵大家共享資源與互助學習，因此推出 Chrome Extension APP
          快速抓取網站資源，免去填寫大量複雜資訊，降低彼此新增資源的門檻與意願！
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '20px auto',
          '@media (max-width: 767px)': {
            margin: '0 5%',
          },
        }}
      >
        <Button
          variant="contained"
          onClick={() => {
            window?.open(
              'https://chrome.google.com/webstore/detail/hcjaenainlhcfpofopninhciegmeilae',
              '_blank',
            );
          }}
          sx={{
            backgroundColor: '#16b9b3',
            color: '#fff',
            borderRadius: '16px',
            '&:hover': {
              backgroundColor: '#16b9b3',
              opacity: '0.8',
              color: '#fff',
            },
          }}
        >
          立即下載體驗！
        </Button>
      </Box>
    </GuideWrapper>
  );
}

export default ComingSoon;
