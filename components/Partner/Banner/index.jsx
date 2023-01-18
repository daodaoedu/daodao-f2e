import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import BannerImage from './BannerImage';

const Banner = () => {
  return (
    <Box sx={{ height: '60vh', zIndex: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '80px',
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '36px',
            lineHeight: '140%',
            color: '#536166',
          }}
        >
          尋找夥伴
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '140%',
            color: '#536166',
          }}
        >
          想找到一起交流的學習夥伴嗎
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '140%',
            color: '#536166',
          }}
        >
          註冊加入會員，並填寫個人資料，你的資訊就會刊登在頁面上囉！
        </Typography>
        <Button
          variant="contained"
          sx={{
            fontSize: '16px',
            marginTop: '40px',
            color: '#FFFFFF',
            boxShadow: '0px 4px 10px rgba(89, 182, 178, 0.5)',
            borderRadius: '20px',
            padding: '9px 40px',
          }}
        >
          註冊新夥伴
        </Button>
      </Box>
      <BannerImage />
    </Box>
  );
};

export default Banner;
