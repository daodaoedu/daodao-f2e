import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import window from 'global/window';

const LearningResource = () => {
  return (
    <Box>
      <Box
        sx={{
          margin: '20px 0',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            margin: '40px 0 10px 0',
          }}
        >
          一、新增多元學習資源
        </Typography>
        <Typography variant="p">
          多元學習資源整合各領域各類型資源，此資源需具有學習意義（涵蓋素養教育中認知、情意、技能其中一項即可），此外不得放腥羶色、暴力、違反人權的資源。而資源類型包含但不限於網站、影片、組織、APP、Podcast、書、沒有時效性的線上課程及活動、學習社群（例如：Facebook社團、LINE社群、Instagram帳號、粉絲專頁）、每年固定都有或是沒有時效性的提案／競賽。
        </Typography>
        <Typography
          variant="p"
          sx={{
            margin: '10px 0',
            fontWeight: '500',
          }}
        >
          我們鼓勵彼此資源共享與共學的精神，歡迎留下自己的名稱/暱稱來展示自己的資源貢獻，也歡迎在表單上留下個人網站/專頁來曝光自己。
        </Typography>
        <Typography
          component="p"
          sx={{ fontWeight: '500', fontSize: '16px', marginTop: '12px' }}
        >
          目前新增資源的方式有兩種：
        </Typography>
        <Box sx={{ margin: '10px 0 10px 20px' }}>
          <Typography component="p" sx={{ fontWeight: '500' }}>
            1. 使用全新推出的 Chrome Extension APP 來新增資源
          </Typography>
        </Box>
        <Box
          component="img"
          src="/assets/extension-banner.png"
          sx={{
            display: 'block',
            height: '300px',
            margin: '20px auto 0 auto',
            '@media (max-width: 767px)': {
              width: '100%',
              height: 'auto',
              marginTop: '20px',
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px auto',
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
        <Box sx={{ margin: '10px 0 10px 20px' }}>
          <Typography component="p" sx={{ fontWeight: '500' }}>
            2. 填寫Google Form
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          margin: '40px 0 20px 0',
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdE9URRYAEJj1I8b-RJ6EG4PZ_5ggm_mcGq7Jis1LFxpjXvrw/viewform?embedded=true"
          width="100%"
          height="3600"
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

export default LearningResource;
