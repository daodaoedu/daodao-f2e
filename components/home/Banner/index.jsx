import styled from '@emotion/styled';
import Box from "@mui/material/Box";
import Button from '@mui/material/Button';
import SearchField from '../../../shared/components/SearchField';

const TopBox = styled(Box)`
  position: absolute;
  top: 40%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
`;

const BottomBox = styled(Box)`
  position: absolute;
  left: 50%;
  bottom: 5%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const BannerWrapper = styled.div`
  ${TopBox} {
    h1 {
      font-size: 24px;
      line-height: 28px;
      letter-spacing: 0.08em;
      color: #F0F0F0;
      font-weight: 500;
      text-align: center;
    }

    h2 {
      font-size: 16px;
      line-height: 22px;
      letter-spacing: 0.08em;
      text-align: center;
      margin-top: 10px;
      color: #F0F0F0;
      font-weight: 500;
    }
  }

  ${BottomBox} {
    h3 {
      line-height: 28px;
      letter-spacing: 0.08em;
      color: #F0F0F0;
      font-weight: 500;
      text-align: center;
      font-size: 36px;
      line-height: 22px;
      letter-spacing: 0.08em;
      text-align: center;
      margin: 20px;
    }
  }
  
  /* @media (max-width: 767px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  } */
`;

const Banner = () => {
  return (
    <BannerWrapper>
      <TopBox>
        <h1>歡迎來到島島阿學！一起找找資源、共編資源吧～</h1>
        <h2>If you want to go fast go alone. If you what to go far go together.</h2>
        <SearchField />
      </TopBox>
      <BottomBox>
        <h3>還不知道學什麼嗎？別擔心。</h3>
        <Button variant="contained">看看大家都學什麼</Button>
      </BottomBox>
      {/* <ImageStyled
        src="/connectDao.webp"
        alt="connect-dao"
      />
      <BannerContentWrapper>
        <HeaderStyled>
          歡迎來到島島阿學！一起找找資源、共編資源吧
        </HeaderStyled>
        <ContentStyled>
          If you want to go fast go alone.
          <br />
          If you want to go far go together.
          <br />
          <br />
          <p>今晚，要不要來點＿＿的學習資源？ (點進去即可看到各領域的資源)</p>
        </ContentStyled>
      </BannerContentWrapper> */}
    </BannerWrapper>
  );
};

export default Banner;
