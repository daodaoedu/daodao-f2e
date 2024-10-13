import React, { useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import SEOConfig from '@/shared/components/SEO';
import Navigation from '@/shared/components/Navigation_v2';
import Footer from '@/shared/components/Footer_v2';
import { BASE_URL } from '@/constants/common';
import openLoginWindow from '@/utils/openLoginWindow';
import { useSelector } from 'react-redux';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  background: linear-gradient(0deg, #f3fcfc, #f3fcfc), #f7f8fa;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  margin: 60px auto;
  padding: 40px 40px;
  max-width: 440px;
  width: 100%;
  @media (max-width: 767px) {
    width: 90%;
    .title {
      text-overflow: ellipsis;
      width: 100%;
    }
  }
`;

const LoginPage = () => {
  const LOGIN_PATH = `${BASE_URL}/auth/google`;
  const router = useRouter();
  const me = useSelector((state) => state.user);

  const SEOData = useMemo(
    () => ({
      title: '登入島島｜島島阿學',
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

  useEffect(() => {
    if (me?._id) {
      router.push('/');
    }
  }, []);

  return (
    <HomePageWrapper>
      <Script src="https://meet.jit.si/external_api.js" />
      <SEOConfig data={SEOData} />
      <Navigation />
      <Box sx={{ minHeight: '100vh' }}>
        <ContentWrapper>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '22px',
              lineHeight: '140%',
              textAlign: 'center',
              color: '#536166',
              marginBottom: '24px',
            }}
          >
            歡迎回來島島阿學！
          </Typography>
          <LazyLoadImage
            alt="login"
            src="https://imgur.com/EADd1UD.png"
            height={300}
            width={300}
            effect="opacity"
            style={{
              borderRadius: '6px',
              background: 'rgba(240, 240, 240, .8)',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            placeholder={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <Skeleton
                sx={{
                  height: '300px',
                  width: '300px',
                  borderRadius: '6px',
                  background: 'rgba(240, 240, 240, .8)',
                  marginTop: '4px',
                }}
                variant="rectangular"
                animation="wave"
              />
            }
          />
          <Button
            onClick={() => openLoginWindow('/', LOGIN_PATH)}
            sx={{
              width: '100%',
              marginTop: '24px',
              borderRadius: '20px',
              color: '#fff',
              bgcolor: '#16B9B3',
              boxShadow: '0px 4px 10px rgba(89, 182, 178, 0.5)',
            }}
            variant="contained"
          >
            Google 登入 / 註冊
          </Button>
          <Box sx={{ marginTop: '24px' }}>
            <Typography sx={{ color: '#536166', fontSize: '14px' }}>
              {`註冊即代表您同意島島阿學的 `}
              <Typography
                onClick={() => {
                  router.push('/privacypolicy');
                }}
                sx={{
                  color: '#16B9B3',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                服務條款
              </Typography>
              {` 與 `}
              <Typography
                onClick={() => {
                  router.push('/privacypolicy');
                }}
                sx={{
                  color: '#16B9B3',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                隱私政策
              </Typography>
            </Typography>
          </Box>
        </ContentWrapper>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default LoginPage;
