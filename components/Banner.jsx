import styled from '@emotion/styled';
import Image from '@/shared/components/Image';
import { Box } from '@mui/material';

import LearningMarathonImgDesktopGroup from '@/public/assets/learning-marathon/2025S1-desktop-group.png';
import LearningMarathonImgDesktopIcon1 from '@/public/assets/learning-marathon/2025S1-desktop-icon-1.png';
import LearningMarathonImgDesktopIcon2 from '@/public/assets/learning-marathon/2025S1-desktop-icon-2.png';
import LearningMarathonImgDesktopIcon3 from '@/public/assets/learning-marathon/2025S1-desktop-icon-3.png';
import LearningMarathonImgDesktopIcon4 from '@/public/assets/learning-marathon/2025S1-desktop-icon-4.png';
import LearningMarathonImgDesktopIcon5 from '@/public/assets/learning-marathon/2025S1-desktop-icon-5.png';
import LearningMarathonImgDesktopIcon6 from '@/public/assets/learning-marathon/2025S1-desktop-icon-6.png';
import LearningMarathonImgDesktopGirl from '@/public/assets/learning-marathon/2025S1-desktop-girl-1.png';
import LearningMarathonImgDesktopBoy from '@/public/assets/learning-marathon/2025S1-desktop-boy-1.png';
import LearningMarathonImgDesktopBg from '@/public/assets/learning-marathon/2025S1-desktop-bg.png';
import LearningMarathonImgMobile from '@/public/assets/learning-marathon/2025S1-mobile@2x.png';

import { cn } from '@/utils/cn';

const StyledBanner = styled(Box)`
  width: 100%;
  height: calc(100vw / 1.6);
  position: relative;
  box-sizing: border-size;
  overflow: hidden;

  @media (max-width: 767px) {
    height: calc(100vw / 0.6428);
  }
`;

const Banner = ({ children }) => {
  return (
    <StyledBanner>
      <div className="hidden md:block">
        <div className="absolute inset-0">
          <Image
            src={LearningMarathonImgDesktopBg.src}
            alt="島島盃 - 學習馬拉松 2025 春季賽"
            height="inherit"
            background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
            borderRadius="0"
          />
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] aspect-[433/427]",
            "opacity-0 animate-fade-in animate-duration-700 animate-delay-200",
          )}
        >
          <Image
            src={LearningMarathonImgDesktopGroup.src}
            alt="揪團"
            height="inherit"
            borderRadius="0"
          />
        </div>
        <div
          className={cn(
            "absolute top-[39%] -left-[2.8%] w-[18%] aspect-[271/404]",
            "-translate-x-full animate-slide-x-in -animate-distance-full animate-duration-1100 animate-delay-500",
          )}
        >
          <Image
            src={LearningMarathonImgDesktopBoy.src}
            alt="男角色"
            height="inherit"
            borderRadius="0"
          />
        </div>
        <div
          className={cn(
            "absolute top-[33%] -right-[1.6%] w-[18%] aspect-[256/351]",
            "translate-x-full animate-slide-x-in animate-duration-1100 animate-delay-1100",
          )}
        >
          <Image
            src={LearningMarathonImgDesktopGirl.src}
            alt="女角色"
            height="inherit"
            borderRadius="0"
          />
        </div>
        <div
          className={cn(
            "absolute top-[14%] left-[27.5%] w-[5%] aspect-[75/77]",
            "opacity-0 animate-fade-in animate-duration-500 animate-delay-200",
          )}
        >
          <div className="animate-oscillate animate-delay-200">
            <Image
              src={LearningMarathonImgDesktopIcon5.src}
              alt="icon5"
              height="inherit"
              borderRadius="0"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute top-[19.5%] left-[21%] w-[6%] aspect-[91/131]",
            "opacity-0 animate-fade-in animate-duration-500 animate-delay-1700",
          )}
        >
          <div className="animate-oscillate animate-delay-1700">
            <Image
              src={LearningMarathonImgDesktopIcon3.src}
              alt="icon3"
              height="inherit"
              borderRadius="0"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute top-[45.5%] left-[27.5%] w-[4.8%] aspect-[70/39]",
            "opacity-0 animate-fade-in animate-duration-500 animate-delay-500",
          )}
        >
          <div className="animate-oscillate animate-delay-1100">
            <Image
              src={LearningMarathonImgDesktopIcon1.src}
              alt="icon1"
              height="inherit"
              borderRadius="0"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute top-[16.5%] right-[24.5%] w-[4.7%] aspect-[68/112]",
            "opacity-0 animate-fade-in animate-duration-500 animate-delay-1300",
          )}
        >
          <div className="animate-oscillate animate-delay-1900">
            <Image
              src={LearningMarathonImgDesktopIcon4.src}
              alt="icon4"
              height="inherit"
              borderRadius="0"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute top-[29%] right-[18.5%] w-[5.9%] aspect-[85/72]",
            "opacity-0 animate-fade-in animate-duration-500 animate-delay-500",
          )}
        >
          <div className="animate-oscillate animate-delay-300">
            <Image
              src={LearningMarathonImgDesktopIcon2.src}
              alt="icon2"
              height="inherit"
              borderRadius="0"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute top-[40%] right-[20.5%] w-[11%] aspect-[160/153]",
            "opacity-0 animate-fade-in animate-duration-500 animate-delay-1900",
          )}
        >
          <div className="animate-oscillate animate-delay-1300">
            <Image
              src={LearningMarathonImgDesktopIcon6.src}
              alt="icon6"
              height="inherit"
              borderRadius="0"
            />
          </div>
        </div>
      </div>
      <div className="md:hidden">
        <Image
          src={LearningMarathonImgMobile.src}
          alt="島島盃 - 學習馬拉松 2025 春季賽"
          height="inherit"
          background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
          borderRadius="0"
        />
      </div>
      {children}
    </StyledBanner>
  );
};

export default Banner;
