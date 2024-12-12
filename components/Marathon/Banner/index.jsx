import styled from '@emotion/styled';
import Button from '@/shared/components/Button';
import groupBannerImg from '@/public/assets/group-banner.png';
import Image from '@/shared/components/Image';
import InfoCompletionGuard from '@/shared/components/InfoCompletionGuard';
import { useAuthDispatch } from '@/contexts/Auth';

const StyledBanner = styled.div`
  position: relative;
  height: 398px;

  picture {
    position: absolute;
    z-index: -1;
    width: 100%;
    top: 0;
    height: 100%;

    img {
      height: inherit;
      object-fit: cover;
    }
  }
`;

const StyledBannerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
  
  h1 {
    margin-bottom: 8px;
    font-weight: 700;
    font-size: 36px;
    line-height: 140%;
    color: #536166;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 140%;
    color: #536166;
  }
`;

const Banner = () => {
  const { openLoginModal } = useAuthDispatch();

  return (
    <StyledBanner>
      <picture>
        <Image
          src={groupBannerImg.src}
          alt="島島盃 - 學習馬拉松 2025 春季賽"
          height="inherit"
          background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
          borderRadius="0"
        />
      </picture>
      <StyledBannerContent>
        <h1>島島盃 - 學習馬拉松 2025 春季賽</h1>
        <p>註冊並加入我們，立即報名！</p>
        <InfoCompletionGuard>
          <Button onClick={() => openLoginModal({ redirectUrl: '/learning-marathon/signup' })}>立即報名</Button>
        </InfoCompletionGuard>
      </StyledBannerContent>
    </StyledBanner>
  );
};

export default Banner;
