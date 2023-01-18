import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import Router, { useRouter } from 'next/router';
import Script from 'next/script';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import toast from 'react-hot-toast';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import SEOConfig from '../../shared/components/SEO';
import Navigation from '../../shared/components/Navigation_v2';
import Footer from '../../shared/components/Footer_v2';
import sendDataToChromeExtension from '../../utils/sendDataToChromeExtension';

const HomePageWrapper = styled.div`
  --section-height: calc(100vh - 80px);
  --section-height-offset: 80px;
  img{
    width:100%;

  }
`;

const PartnerPage = () => {
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
  return (
    <HomePageWrapper>
      <Script src="https://meet.jit.si/external_api.js" />
      <SEOConfig data={SEOData} />
      <Navigation />
      <Box>
      <Box sx={{}}>
        <img
          src="https://imgur.com/I1kqcv5.png"
          alt="nobody-land"
          width="1440"
          height="400"
        />
      </Box>
      </Box>
      <Footer />
    </HomePageWrapper>
  );
};

export default PartnerPage;
