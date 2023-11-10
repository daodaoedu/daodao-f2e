import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Button from '@/shared/components/Button';
import groupBannerImg from '@/public/assets/group-banner.png';
import Image from '@/shared/components/Image';

const StyledBanner = styled.div`
  position: relative;

  picture {
    position: absolute;
    width: 100%;
    top: 0;
    height: 398px;
    img {
      height: inherit;
    }
  }

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

  > div {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 100px;
  }
`;

const Banner = () => {
  const router = useRouter();

  const handleClick = () => {
    // TODO: 判斷是否登入決定按鈕導向哪個頁面
    router.push('/login');
  };

  return (
    <StyledBanner>
      <picture>
        <Image
          src={groupBannerImg.src}
          alt="揪團封面"
          height="inherit"
          background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
          borderRadius="0"
        />
      </picture>
      <div>
        <h1>揪團</h1>
        <p>想一起組織有趣的活動或學習小組嗎？</p>
        <p>註冊並加入我們，然後創建你的活動，讓更多人一起參加！</p>
        <Button onClick={handleClick}>我想揪團</Button>
      </div>
    </StyledBanner>
  );
};

export default Banner;
