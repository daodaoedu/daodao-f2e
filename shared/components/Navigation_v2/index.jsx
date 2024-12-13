import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { AppBar } from '@mui/material';
import MainNav from './MainNav';
import PromotionBar from './PromotionBar';

export const NavigationWrapper = styled(AppBar)(({ hasPromote }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 'auto',
  minHeight: '68px',
  padding: '0',
  ...(hasPromote && {
    padding: '0',
    height: 'auto',
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

const texts = [
  '✨「島島盃 -  2025 春季學習馬拉松」開跑啦！1/19 截止報名！✨',
  '✨參加學習馬拉松，一起為自己重新打造喜歡的學習生活吧！✨',
  '✨報名學習馬拉松，即可試用最新個人化功能輔助學習唷！✨',
];


// const ToolbarWrapper = styled(Toolbar)`
//   margin: 0 auto;
// `;
// 問卷 https://docs.google.com/forms/d/e/1FAIpQLSeyU9-Q-kIWp5uutcik3h-RO4o5VuG6oG0m-4u1Ua18EOu3aw/viewform
const Navigation = () => {
  const [showPromotetionBar, setShowPromotionBar] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // 設置一個定時器，每 5 秒更換一次文字
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 8000);

    // 清除定時器以防止內存洩漏
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <>
      <NavigationWrapper position="sticky" hasPromote={showPromotetionBar}>
        <PromotionBar
          isShow={showPromotetionBar}
          link="https://ocf.tw/p/daodao/"
          text={texts[currentIndex]}
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
