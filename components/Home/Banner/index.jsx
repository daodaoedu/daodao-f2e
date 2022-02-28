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
              "font-size": "24px",
              "line-height": "28px",
              "letter-spacing": "0.08em",
              color: "#f0f0f0",
              "font-weight": "500",
              "text-align": "center",
            }}
          >
            歡迎來到島島阿學！一起找找資源、共編資源吧～
          </Typography>
          <Typography
            variant="h2"
            sx={{
              "font-size": "16px",
              "line-height": "22px",
              "letter-spacing": "0.08em",
              "text-align": "center",
              "margin-top": "10px",
              color: "#f0f0f0",
              "font-weight": "500",
            }}
          >
            If you want to go fast go alone. If you what to go far go together.
          </Typography>
          <SearchField />
        </MainBannerWrapper>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            marginBottom: "70px",
            width: "100%",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              "letter-spacing": "0.08em",
              color: "#f0f0f0",
              "font-weight": "500",
              "text-align": "center",
              "font-size": "30px",
              margin: "20px",
            }}
          >
            還不知道學什麼嗎？
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
