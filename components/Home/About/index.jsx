import React from 'react';
import styled from '@emotion/styled';
import { Box, Chip, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { CATEGORIES } from '../../../constants/category';

const GuideWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 40px;
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

const About = () => {
  const router = useRouter();
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
          marginLeft: '20px',
        }}
      >
        來點島島阿學的資源吧！
      </Typography>
      <Box
        sx={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          '@media(max-width: 767px)': {
            flexDirection: 'column',
          },
        }}
      >
        <img
          src="/assets/coffeeandlearning.gif"
          width="200"
          height="200"
          // src="https://www.daoedu.tw/cdn-cgi/image/width=200,height=200,quality=80,format=webp/assets/coffeeandlearning.gif"
          alt="coffeeandlearning"
        />
        <Box
          sx={{
            marginTop: '20px',
            marginLeft: '20px',
            fontSize: '18px',
          }}
        >
          <Box sx={{ margin: '5px 0', fontWeight: '500', fontSize: '20px' }}>
            <Typography>
              「學習資源爆炸多，卻常常找不到適合自己的？」
            </Typography>
          </Box>
          <Box sx={{ margin: '5px 0' }}>
            <Typography>✅ 由各領域資深學習者分享及彙整</Typography>
          </Box>
          <Box sx={{ margin: '5px 0' }}>
            <Typography>✅ 免費資源百百種</Typography>
          </Box>
          <Box sx={{ margin: '5px 0' }}>
            <Typography>✅ 資源跨領域跨年齡跨國</Typography>
          </Box>
          <Box sx={{ margin: '5px 0' }}>
            <Typography>✅ 三鍵篩選出合適資源</Typography>
          </Box>
          <Box sx={{ margin: '5px 0' }}>
            <Typography>✅ 人人都可以分享資源</Typography>
          </Box>
          <Box
            sx={{
              margin: '10px 0',
            }}
          >
            自主學習的時代，用共好共享成為彼此學習路上的橋樑吧！
          </Box>
          <Box
            sx={{
              margin: '20px 0',
            }}
          >
            <Typography
              variant="p"
              sx={{
                fontWeight: 'bold',
              }}
            >
              豐富的學習類別
            </Typography>
            <Box sx={{ margin: '10px 0' }}>
              {CATEGORIES.map(({ value, label }) => (
                <Chip
                  key={value}
                  label={label}
                  value={value}
                  onClick={() => router.push(`/resource/categories/${value}`)}
                  sx={{
                    backgroundColor: 'rgb(219, 237, 219)',
                    opacity: '60%',
                    cursor: 'pointer',
                    margin: '5px',
                    whiteSpace: 'nowrap',
                    fontWeight: 500,
                    fontSize: '16px',
                    '&:hover': {
                      opacity: '100%',
                      backgroundColor: 'rgb(219, 237, 219)',
                      transition: 'transform 0.4s',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </GuideWrapper>
  );
};

export default About;
