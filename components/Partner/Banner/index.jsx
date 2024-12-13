import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import Button from '@/shared/components/Button';
import Image from '@/shared/components/Image';
import partnerImg from '@/public/assets/partner-banner.png';
import { useSelector } from 'react-redux';

const StyledBanner = styled(Box)(({ theme }) => ({
  height: '398px',
  zIndex: 0,
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    height: '256px',
  },
  '> picture': {
    position: 'absolute',
    width: '100%',
    top: 0,
    height: '398px',
    zIndex: -1,
    [theme.breakpoints.down('md')]: {
      height: '256px',
    },
    img: {
      height: 'inherit',
    },
  },
}));

const StyledContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  paddingBottom: '40px',
  [theme.breakpoints.down('md')]: {
    paddingBottom: '0',
  },
  '> h1': {
    fontWeight: 700,
    fontSize: '36px',
    lineHeight: '140%',
    color: '#536166',
    marginBottom: '8px',
    [theme.breakpoints.down('md')]: {
      fontSize: '22px',
    },
  },
  '> p': {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '140%',
    color: '#536166',
    [theme.breakpoints.down('md')]: {
      textAlign: 'center',
    },
  },
}));

const Banner = () => {
  const router = useRouter();
  // select token from user
  const { token } = useSelector((state) => state.user);

  return (
    <StyledBanner>
      <StyledContent>
        <h1>尋找夥伴</h1>
        <p>想找到一起交流的學習夥伴嗎</p>
        <p>註冊加入會員，並填寫個人資料，你的資訊就會刊登在頁面上囉！</p>
        {!token && (
          <Button onClick={() => router.push('/login')}>註冊找夥伴</Button>
        )}
      </StyledContent>

      <picture>
        <Image
          src={partnerImg.src}
          alt="尋找夥伴"
          height="inherit"
          background="linear-gradient(#fcfefe 10%, #e0f1f2 40%)"
          borderRadius="0"
        />
      </picture>
    </StyledBanner>
  );
};

export default Banner;
