import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { AppBar } from '@mui/material';
import MainNav from './MainNav';
import PromotionBar from './PromotionBar';

export const NavigationWrapper = styled(AppBar)(({ hasPromote }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '80px',
  padding: '0 5%',
  ...(hasPromote && {
    padding: '38px 5% 0',
    height: '118px',
  }),
  '.MuiToolbar-root': {
    padding: '0',
  },
}));

const donateTexts = [
  '✨島島阿學需要你的支持，讓人人都享有同等資源✨',
  '✨推廣民主教育，島島阿學需要你的支持✨',
  '✨用捐款與島島阿學一同推動民主教育✨',
];

const buildRandomText = () => {
  const randomIndex = Math.floor(Math.random() * donateTexts.length);
  return donateTexts[randomIndex];
};

// const ToolbarWrapper = styled(Toolbar)`
//   margin: 0 auto;
// `;
// 問卷 https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform
const Navigation = () => {
  const [showPromotetionBar, setShowPromotionBar] = useState(true);

  return (
    <>
      <NavigationWrapper position="sticky" hasPromote={showPromotetionBar}>
        <PromotionBar
          isShow={showPromotetionBar}
          link="https://ocf.tw/p/daodao/"
          text={buildRandomText()}
          toggleAction={setShowPromotionBar}
        />
        {/* <Toolbar> */}
        <MainNav height={showPromotetionBar ? '118px' : '80px'} />
        {/* </Toolbar> */}
      </NavigationWrapper>
    </>
  );
};

export default Navigation;
