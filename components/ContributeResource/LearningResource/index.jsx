import React from 'react';
import styled from '@emotion/styled';
import { Box, Paper, Typography } from '@mui/material';

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
          一、多元學習資源
        </Typography>
        <Typography variant="p">
          多元學習資源整合各領域各類型資源，此資源需具有學習意義（涵蓋素養教育中認知、情意、技能其中一項即可），此外不得放腥羶色、暴力、違反人權的資源。而資源類型包含網站、影片、組織、APP、Podcast、書、沒有時效性的線上課程及活動、學習社群（例如：Facebook社團、LINE社群、Instagram帳號、粉絲專頁）、每年固定都有或是沒有時效性的提案／競賽。
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
