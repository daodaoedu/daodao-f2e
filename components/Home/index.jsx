import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { Button, Divider } from '@mui/material';
import Banner from '../Banner';
import Guide from './Guide';
import About from './About';
import Group from './Group';
import Edm from './Edm';
import FacebookPosts from './FacebookPosts';
import WishResource from './WishResource';
import APPBanner from './APPBanner';

const StyledBannerButton = styled(Button)`
  &.MuiButton-root {
    position: absolute;
    top: calc(100vw / 3.65);
    left: 50%;
    transform: translate(-50%);
    border-radius: 40px;
    background: #FFA10B;
    display: flex;
    width: 220px;
    height: 40px;
    padding: 5px 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    color: #FFF;
  }
    &.MuiButton-text {
      color: #FFF;
      text-align: center;
      font-size: 18px;
      font-weight: 400;
      line-height: 140%;
    }

  @media (hover: hover) {
    &.MuiButton-root:hover {
      box-shadow: 0px 4px 10px 0px rgba(255, 161, 11, 0.50);
    }
  }

  @media (max-width: 767px) {

    &.MuiButton-root {
      font-size: 14px;
      width: 180px;
      height: 50px;
      top: calc(100vw / 1.2);
    }
  }
`;

function Home() {
  const guideRef = useRef(null);
  const router = useRouter();
  return (
    <div>
      <Banner>
        <StyledBannerButton onClick={() => { router.push('/learning-marathon#marathon-intro'); }}>
          不要錯過！點我了解
        </StyledBannerButton>
      </Banner>
      <About />
      <Divider sx={{ margin: '10px 0' }} />
      <APPBanner />
      <Divider sx={{ margin: '10px 0' }} />
      <FacebookPosts />
      <Divider sx={{ margin: '10px 0' }} />
      <Group />
      <Divider sx={{ margin: '10px 0' }} />
      <WishResource />
      <Divider sx={{ margin: '10px 0' }} />
      <div ref={guideRef} />
      <Guide />
      <Divider sx={{ margin: '10px 0' }} />
      <Edm />
    </div>
  );
}

export default Home;
