import React from 'react';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import { Typography, Button, Paper } from '@mui/material';
import { FacebookRounded } from '@mui/icons-material';
import Chip from '@mui/material/Chip';
import { useRouter } from 'next/router';
import Navigatin from '../shared/components/Navigation_v2';
import Footer from '../shared/components/Footer_v2';
import { COLOR_TABLE } from '../constants/notion';
import { CATEGORIES } from '../constants/category';
import RelatedResources from '../shared/components/RelatedResources';

const BodyWrapper = styled.div`
  background-color: #f5f5f5;
`;

const NotExistPage = () => {
  const router = useRouter();
  return (
    <BodyWrapper>
      <Navigatin />
      <Paper
        sx={{
          width: '90%',
          margin: '20px auto',
          padding: '20px',
          minHeight: '60vh',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: '#536166',
            marginTop: '10px',
            fontWeight: 'bold',
            fontSize: '30px',
            letterSpacing: '0.08em',
            textAlign: 'center',
            marginRight: '20px',
          }}
        >
          這座島已經搬新家囉
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/assets/nobody-land.gif"
            alt="nobody-land"
            width="300"
            height="300"
          />
        </Box>
        <Typography
          variant="p"
          sx={{
            // fontWeight: "bold",
            fontSize: '20px',
            // margin: "10px",
            textAlign: 'center',
            width: '100%',
          }}
        >
          近期網站改版，可能有部分頁面無法使用，可以參觀其他地方唷～
        </Typography>
        <Typography
          variant="p"
          sx={{
            // fontWeight: "bold",
            fontSize: '20px',
            // margin: "10px",
            textAlign: 'center',
            width: '100%',
            marginTop: '10px',
          }}
        >
          要不要試試我們新版的資源搜尋或是參觀其他地方呢？
        </Typography>
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
            {CATEGORIES.map(({ key, value }) => (
              <Chip
                key={key}
                label={value}
                value={value}
                onClick={() => router.push(`/search?cats=${value}`)}
                sx={{
                  backgroundColor: COLOR_TABLE.green,
                  opacity: '60%',
                  cursor: 'pointer',
                  margin: '5px',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  fontSize: '16px',
                  '&:hover': {
                    opacity: '100%',
                    backgroundColor: COLOR_TABLE.green,
                    transition: 'transform 0.4s',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
        <RelatedResources
          title="👀 瞧瞧最新資源"
          searchScheme={{
            filter: { or: [] },
            page_size: 10,
          }}
        />
        <Box
          sx={{
            margin: '40px 0 10px 0',
          }}
        >
          <Typography
            variant="p"
            sx={{
              fontWeight: 'bold',
            }}
          >
            加入島島社群
          </Typography>
          <Box
            sx={{
              margin: '20px 0',
            }}
          >
            <Button variant="outlined" onClick={() => router.push('/join')}>
              <FacebookRounded sx={{ margin: '5px 0' }} />
              <Typography variant="p">加入社群</Typography>
            </Button>
          </Box>
        </Box>
      </Paper>
      <Footer />
    </BodyWrapper>
  );
};

export default NotExistPage;
