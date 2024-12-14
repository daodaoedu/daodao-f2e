import React from 'react';
import styled from '@emotion/styled';
import Image from '@/shared/components/Image';
import LearningMarathonImgDesktop from '@/public/assets/learning-marathon-2025S1-desktop@2x.png';
import LearningMarathonImgMobile from '@/public/assets/learning-marathon-2025S1-mobile@2x.png';
import { Box,Button} from '@mui/material';
import { useRouter } from 'next/router';

const StyledBanner = styled(Box)`
  width: 100%;
  height: calc(100vw / 1.6);
  position: relative;
  box-sizing: border-size;

  .mobile {
    display: none;
  }

  @media (max-width: 767px) {
    height: calc(100vw / 0.6428);
    .desktop { display: none; }
    .mobile { display: block; }
  }
`;
const StyledBannerButton = styled(Button)`
  &.MuiButton-root {
    position: absolute;
    top: calc(100vw / 3.6);
    left: 50%;
    transform: translate(-50%);
    border-radius: 40px;
    background: #FFA10B;
    display: flex;
    width: 250px;
    height: 50px;
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
      top: calc(100vw / 1.434);
    }
  }
`;

const MarathonBanner = () => {
    const router = useRouter();
    
    return (
        <StyledBanner>
        <Box className="desktop">
        <Image
            src={LearningMarathonImgDesktop.src}
            alt="島島盃 - 學習馬拉松 2025 春季賽"
            height="inherit"
            background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
            borderRadius="0"
            className="desktop"
        />
        </Box>
        <Box className="mobile">
        <Image
            src={LearningMarathonImgMobile.src}
            alt="島島盃 - 學習馬拉松 2025 春季賽"
            height="inherit"
            background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
            borderRadius="0"
            className="mobile"
        />
        </Box>
        <StyledBannerButton onClick={() => { router.push('/learning-marathon#marathon-intro'); }}>
            不要錯過！點我了解
        </StyledBannerButton>
    </StyledBanner>
    );
};

export default MarathonBanner;
