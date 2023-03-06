import React, { useState } from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { Button, Typography } from '@mui/material';
import { FacebookRounded } from '@mui/icons-material';
import { useRouter } from 'next/router';
import WramModal from '../../../shared/components/WarmModal';

const GroupWrapper = styled.div`
  width: 90%;
  /* height: calc(var(--section-height) + var(--section-height-offset)); */
  margin: 0 auto;
  padding-top: 40px;
  padding-bottom: 40px;

  @media (max-width: 767px) {
    padding-top: 40px;
    padding-bottom: 20px;
  }
`;

const JoinCooperate = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <GroupWrapper>
      <Typography
        variant="h2"
        sx={{
          color: '#536166',
          fontWeight: 'bold',
          fontSize: '26px',
          lineHeight: '50px',
          letterSpacing: '0.08em',
          textAlign: 'left',
          marginRight: '20px',
          '@media(max-width: 767px)': {
            textAlign: 'left',
          },
        }}
      >
        加入島島阿學營運團隊
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
        <Box
          component="img"
          // src="https://www.daoedu.tw/cdn-cgi/image/width=300,height=300,quality=80,format=webp/assets/group.gif"
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2Q0NmU2Y2QwYmViMDgxZDZlZWJjZTE3MTk2YzdmY2M3M2E1ZTU4ZiZjdD1n/l4KibK3JwaVo0CjDO/giphy.gif"
          sx={{
            width: '200px',
            height: '200px',
            borderRadius: '20px',
          }}
          alt="group"
        />
        <Box
          sx={{
            marginTop: '50px',
            marginLeft: '20px',
            fontSize: '18px',
            '@media(max-width: 767px)': {
              marginLeft: '0px',
            },
          }}
        >
          <Typography variant="p" sx={{ margin: '5px 0' }}>
            我們期望可以透過包含但不限於體制內外學生, 斜槓青年, 公民科技,
            各領域人才等集思廣益。
          </Typography>
          <Typography variant="p" sx={{ margin: '5px 0' }}>
            利用閒有餘力的時間一同幫助社會建立共學交流的橋樑
          </Typography>
          <Typography variant="p" x={{ margin: '5px 0' }}>
            如果你也想貢獻你的一份心力，歡迎加入我們一起協作！
          </Typography>
          <Box
            sx={{
              margin: '20px 0 10px 0',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                window.open('https://forms.gle/if2kwAEQkeaTUgm37', '_blank')
              }
              sx={{ margin: '0 10px' }}
            >
              <Typography variant="p">加入團隊</Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                window.open(
                  'https://g0v.hackmd.io/@daodaoedu/HydZGAUYc',
                  '_blank',
                )
              }
              sx={{ margin: '0 10px' }}
            >
              <Typography variant="p">了解更多</Typography>
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                window.open('https://www.daoedu.tw/about', '_blank')
              }
              sx={{ margin: '0 10px' }}
            >
              <Typography variant="p">關於島島</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </GroupWrapper>
  );
};

export default JoinCooperate;
