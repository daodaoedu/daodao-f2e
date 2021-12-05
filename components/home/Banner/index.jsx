import styled from '@emotion/styled';
import Box from "@mui/material/Box";
import SearchField from '../../../shared/components/SearchField';

const BannerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  h1 {
    font-size: 24px;
    line-height: 28px;
    letter-spacing: 0.08em;
    color: #F0F0F0;
    font-weight: 500;
  }

  h2 {
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.08em;
    color: #F0F0F0;
    text-align: center;
    margin-top: 10px;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
`;

const Banner = () => {
  return (
    <BannerWrapper>
      <Box sx={{ display: "flex", flexDirection: "column", alignContent: 'center' }}>
        <h1>歡迎來到島島阿學！一起找找資源、共編資源吧～</h1>
        <h2>If you want to go fast go alone. If you what to go far go together.</h2>
        <SearchField />
      </Box>
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
