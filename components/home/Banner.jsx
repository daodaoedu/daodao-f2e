import { css } from '@emotion/css';
import styled from '@emotion/styled';

const BannerWrapper = styled.div`
  display: flex;
  @media (max-width: 767px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const BannerContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 767px) {
    width: 80%;
    margin: 0 auto;
  }
`;

const Banner = () => {
  return (
    <BannerWrapper>
      <img
        className={css`
              width: 130px; 
              margin-right: 20px;
            `}
        src="/connectDao.webp"
        width="130"
        alt="connect-dao"
      />
      <BannerContentWrapper>
        <h1 className={css`
              font-size: 32px; 
              font-weight: 300;
              margin: 10px 0;
            `}
        >
          歡迎來到島島阿學！一起找找資源、共編資源吧
        </h1>
        <p className={css`
                font-size: 20px; 
                font-weight: 300;
                line-height: 30px;
              `}
        >
          If you want to go fast go alone.
          <br />
          If you want to go far go together.
          <br />
          <br />
          <p>今晚，要不要來點＿＿的學習資源？ (點進去即可看到各領域的資源)</p>
        </p>
      </BannerContentWrapper>
    </BannerWrapper>
  );
};

export default Banner;
