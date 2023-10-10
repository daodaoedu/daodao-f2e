import { memo } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import BannerImage from './BannerImage';

const Banner = () => {
  const router = useRouter();

  return (
    <Box sx={{ position: 'relative' }}>
      <BannerImage />
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '80px',
        }}
      >
        <Typography
          as="h1"
          sx={{
            fontWeight: 700,
            fontSize: '36px',
            lineHeight: '140%',
            color: '#536166',
          }}
        >
          揪團
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '140%',
            color: '#536166',
          }}
        >
          想一起組織有趣的活動或學習小組嗎？
        </Typography>
        <Typography
          sx={{
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '140%',
            color: '#536166',
          }}
        >
          註冊並加入我們，然後創建你的活動，讓更多人一起參加！
        </Typography>
        <Button
          variant="contained"
          sx={{
            fontSize: '16px',
            marginTop: '40px',
            color: '#FFFFFF',
            boxShadow: '0px 4px 10px rgba(89, 182, 178, 0.5)',
            borderRadius: '20px',
            padding: '6px 48px',
          }}
          onClick={() => router.push('/login')}
        >
          我想揪團
        </Button>
      </Box>
    </Box>
  );
};

export default memo(Banner);
