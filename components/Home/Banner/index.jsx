import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";
import SearchField from "../SearchField";
import BannerVideo from "../BannerVideo";

const BannerWrapper = styled.section`
  height: var(--section-height);
`;

const MainBannerWrapper = styled.div`
  margin: 0 auto 0 auto;
  padding-top: 20vh;

  .promo-button {
    margin: 0 auto 0 auto;
  }

  @media (max-width: 768px) {
    width: 80%;
    padding-top: 10vh;
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
    <Box
      sx={{
        position: "relative",
      }}
    >
      <BannerWrapper>
        <MainBannerWrapper>
          <Typography
            variant="h1"
            sx={{
              fontSize: "24px",
              lineHeight: "28px",
              letterSpacing: "0.08em",
              color: "#f0f0f0",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            歡迎來到島島阿學！一起找找資源、分享資源吧！
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: "16px",
              lineHeight: "22px",
              letterSpacing: "0.08em",
              textAlign: "center",
              marginTop: "10px",
              color: "#f0f0f0",
              fontWeight: "500",
            }}
          >
            If you want to go fast go alone. If you what to go far go together.
          </Typography>
          <SearchField />
        </MainBannerWrapper>
        <Box
          sx={{
            // position: "absolute",
            // bottom: 0,
            // marginBottom: "70px",
            width: "100%",
            marginTop: "25vh",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              letterSpacing: "0.08em",
              color: "#f0f0f0",
              fontWeight: "500",
              textAlign: "center",
              fontSize: "26px",
              margin: "20px",
            }}
          >
            還不知道要學什麼嗎？
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "10px 0",
            }}
          >
            <Button
              variant="contained"
              onClick={smoothScroll}
              sx={{ backgroundColor: "white" }}
            >
              看看大家都學什麼
            </Button>
          </Box>
        </Box>
      </BannerWrapper>
      <BannerVideo />
    </Box>
  );
};

export default Banner;
