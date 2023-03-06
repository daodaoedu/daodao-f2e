import React, { useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Divider } from '@mui/material';
import Banner from './Banner';
import Guide from './Guide';
import About from './About';
import Group from './Group';
import Edm from './Edm';
import FacebookPosts from './FacebookPosts';
import WishResource from './WishResource';
import APPBanner from './APPBanner';
import JoinCooperate from './JoinCooperate';

const HomeWrapper = styled.div``;

function Home() {
  const guideRef = useRef(null);
  return (
    <HomeWrapper>
      <Banner guideRef={guideRef} />
      <About />
      <Divider sx={{ margin: '10px 0' }} />
      <APPBanner />
      <Divider sx={{ margin: '10px 0' }} />
      <FacebookPosts />
      <Divider sx={{ margin: '10px 0' }} />
      <Group />
      <Divider sx={{ margin: '10px 0' }} />
      <JoinCooperate />
      <Divider sx={{ margin: '10px 0' }} />
      <WishResource />
      <Divider sx={{ margin: '10px 0' }} />
      <div ref={guideRef} />
      <Guide />
      <Divider sx={{ margin: '10px 0' }} />
      <Edm />
    </HomeWrapper>
  );
}

export default Home;
