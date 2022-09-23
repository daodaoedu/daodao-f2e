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
          三、島島教育場域
        </Typography>
        <Typography variant="p">
          實驗教育場域包含：公辦公營學校、公辦民營、非學校型態-機構自學和非學校型態-團體自學等。
          很開心你成為島島阿學的一員，新增後我們將由平台管理員審核並放入共用資源區。
        </Typography>
      </Box>
      <Box
        sx={{
          margin: '40px 0 20px 0',
        }}
      >
        待補
        {/* <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSdE9URRYAEJj1I8b-RJ6EG4PZ_5ggm_mcGq7Jis1LFxpjXvrw/viewform?embedded=true"
          width="100%"
          height="3600"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
        >
          載入中 . . .
        </iframe> */}
      </Box>
    </Box>
  );
};

export default LearningResource;
