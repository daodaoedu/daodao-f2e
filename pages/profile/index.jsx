import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Script from 'next/script';
import {
  Box,
  Typography,
  Button,
  Skeleton,
  TextField,
  Divider,
  Switch,
  TextareaAutosize,
  Chip,
} from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import toast from 'react-hot-toast';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SEOConfig from '../../shared/components/SEO';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
`;

const Tag = ({ label }) => (
  <Chip
    label={label}
    value={label}
    sx={{
      backgroundColor: '#fff',
      opacity: '80%',
      cursor: 'pointer',
      margin: '5px',
      whiteSpace: 'nowrap',
      fontWeight: 500,
      fontSize: '16px',
      bgcolor: 'rgb(219, 237, 219)',
      '&:hover': {
        opacity: '100%',
        backgroundColor: '#fff',
        transition: 'transform 0.4s',
      },
    }}
  />
);

const ProfilePage = () => {
  const router = useRouter();
  const SEOData = useMemo(
    () => ({
      title: '許浪手的小島｜島島阿學',
      description:
        '「島島阿學」盼能透過建立多元的學習資源網絡，讓自主學習者能找到合適的成長方法，進一步成為自己想成為的人，從中培養共好精神。目前正積極打造「可共編的學習資源平台」。',
      keywords: '島島阿學',
      author: '島島阿學',
      copyright: '島島阿學',
      imgLink: 'https://www.daoedu.tw/preview.webp',
      link: `${process.env.HOSTNAME}${router?.asPath}`,
    }),
    [router?.asPath],
  );

  const tagList = ['衝浪', '還是衝浪', '開車', '買車', '司機', '打電話'];

  return (
    <HomePageWrapper>
      <Script src="https://meet.jit.si/external_api.js" />
      <SEOConfig data={SEOData} />
      <Navigation />
      <Box sx={{ minHeight: '100vh' }}>
        <Box sx={{ padding: '5%' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <LazyLoadImage
              alt="login"
              src="https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c3VyZnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60"
              height={80}
              width={80}
              effect="opacity"
              style={{
                borderRadius: '100%',
                background: 'rgba(240, 240, 240, .8)',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              placeholder={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Skeleton
                  sx={{
                    height: '80px',
                    width: '80px',
                    background: 'rgba(240, 240, 240, .8)',
                    marginTop: '4px',
                  }}
                  variant="circular"
                  animation="wave"
                />
              }
            />

            <Box sx={{ marginLeft: '12px' }}>
              <Typography sx={{ color: '#536166', fontSize: '18px' }}>
                許浪手
              </Typography>
              <Typography component="p" sx={{ color: '#92989A' }}>
                自學生
              </Typography>
              <Typography
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: '12px',
                }}
              >
                <LocationOnOutlinedIcon sx={{ marginRight: '10px' }} />{' '}
                台北市松山區
              </Typography>
            </Box>
          </Box>
          <Box sx={{ marginTop: '24px' }}>
            {tagList.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </Box>
        </Box>
        <Box sx={{ padding: '5%' }}>
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              可分享
            </Typography>
            <Typography sx={{ marginLeft: '12px' }}>自學心得</Typography>
          </Box>
          <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              想一起
            </Typography>
            <Typography sx={{ marginLeft: '12px' }}>
              學習交流、組課、共學、交朋友
            </Typography>
          </Box>
          <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              簡介
            </Typography>
            <Typography component="p" sx={{}}>
              休學一年，目前是高二自學生，一直在探索自己喜歡什麼，
              喜歡聽音樂，最近要開始準備英文考試中檢，有興趣想交流可以來私訊我～
            </Typography>
          </Box>
          <Divider sx={{ color: '#F3F3F3', margin: '6px 0' }} />
          <Box>
            <Typography sx={{ color: '#293A3D', fontWeight: 500 }}>
              網站
            </Typography>
            <Typography sx={{ marginLeft: '12px' }}>xxx</Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default ProfilePage;
