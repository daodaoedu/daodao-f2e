import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { Box, Button } from "@mui/material";
import SearchField from "../SearchField";
import BannerVideo from "../BannerVideo";

const BannerWrapper = styled.section`
  height: var(--section-height);
`;

const MainBannerWrapper = styled.div`
  margin: 0 auto 0 auto;
  padding-top: 20vh;
  .main-title {
    font-size: 24px;
    line-height: 28px;
    letter-spacing: 0.08em;
    color: #f0f0f0;
    font-weight: 500;
    text-align: center;
  }

  .sub-title {
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.08em;
    text-align: center;
    margin-top: 10px;
    color: #f0f0f0;
    font-weight: 500;
  }

  .promo-button {
    margin: 0 auto 0 auto;
  }

  @media (max-width: 768px) {
    width: 80%;
    padding-top: 10vh;
  }
`;

const SubBannerWrapper = styled.div`
  margin: 0 auto 0 auto;
  padding-top: 120px;
  .promo-title {
    letter-spacing: 0.08em;
    color: #f0f0f0;
    font-weight: 500;
    text-align: center;
    font-size: 36px;
    letter-spacing: 0.08em;
    text-align: center;
    margin: 20px;
  }
`;

const Banner = ({ guideRef }) => {
  const smoothScroll = useCallback(() => {
    const top = guideRef?.current?.getBoundingClientRect()?.top - 50 ?? 0;
    window.scrollTo({
      top: top + window.pageYOffset,
      behavior: "smooth",
    });
  }, [guideRef]);

  return (
    <BannerWrapper>
      <BannerVideo />
      <MainBannerWrapper>
        <h1 className="main-title">
          歡迎來到島島阿學！一起找找資源、共編資源吧～
        </h1>
        <h2 className="sub-title">
          If you want to go fast go alone. If you what to go far go together.
        </h2>
        <SearchField />
      </MainBannerWrapper>
      <SubBannerWrapper>
        <h3 className="promo-title">還不知道學什麼嗎？別擔心。</h3>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button variant="contained" onClick={smoothScroll}>
            看看大家都學什麼
          </Button>
        </Box>
      </SubBannerWrapper>
    </BannerWrapper>
  );
};

export default Banner;
