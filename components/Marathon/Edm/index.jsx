import React from 'react';
import styled from '@emotion/styled';
import { Button, Box, Typography, Link } from '@mui/material';

const EdmWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 120px;
  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

function Edm() {
  return (
    <EdmWrapper>
      <Box
        sx={{
          paddingTop: '60px',
          paddingBottom: '8px',
          bgcolor: '#DEF5F5',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          '@media(max-width: 767px)': {
            paddingTop: '40px',
          },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: '#293A3D',
            fontWeight: 'bold',
            fontSize: '26px',
            lineHeight: '140%',
            '@media(max-width: 767px)': {
              fontSize: '22px',
            },
          }}
        >
          想收到最新資訊嗎？
        </Typography>
        <Typography
          variant="h3"
          sx={{
            paddingTop: '8px',
            color: '#293A3D',
            fontWeight: 'bold',
            fontSize: '18px',
            lineHeight: '140%',
            '@media(max-width: 767px)': {
              fontSize: '16px',
            },
          }}
        >
          歡迎訂閱島島電子報
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: '370px',
            paddingTop: '24px',
            paddingBottom: '24px',
            color: '#536166',
            fontWeight: 'bold',
            fontSize: '14px',
            lineHeight: '140%',
            textAlign: 'center',
            '@media(max-width: 767px)': {
              maxWidth: '273px',
              paddingTop: '16px',
              paddingBottom: '16px',
            },
          }}
        >
          每月與您分享最新資訊，內容包含：國內外教育新聞、自學經驗分享、實驗教育職缺、每月最新自學資源
        </Typography>
        <Link href="https://forms.gle/wXuKYmQjzRKRxe387">
          <Button
            variant="contained"
            sx={{
              width: '273px',
              padding: '9px 60px 9px 60px',
              marginBottom: '60px',
              bgcolor: '#16B9B3',
              color: '#FFFFFF',
              borderRadius: '20px',
              fontSize: '16px',
              '@media(max-width: 767px)': {
                marginBottom: '40px',
              },
            }}
          >
            訂閱電子報
          </Button>
        </Link>
      </Box>
    </EdmWrapper>
  );
}

export default Edm;
