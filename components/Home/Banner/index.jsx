import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";
import SearchField from "../SearchField";
import BannerVideo from "../BannerVideo";
import Typed from "react-typed";
import Title from "./Title";

const BannerWrapper = styled.section`
  height: var(--section-height);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const MainBannerWrapper = styled.div`
  margin: 0 auto 0 auto;

  .promo-button {
    margin: 0 auto 0 auto;
  }

  min-width: 600px;

  @media (max-width: 768px) {
    min-width: auto;
    width: 80%;
    padding-top: 10vh;
  }
`;

const SubBannerWrapper = styled.div`
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
    <Box>
      <BannerWrapper>
        <MainBannerWrapper>
          <Title />
          <SearchField />
        </MainBannerWrapper>
        <SubBannerWrapper>
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
              sx={{
                backgroundColor: "#fff",
                opacity: "0.8",
                "&:hover": {
                  backgroundColor: "#fff",
                },
              }}
            >
              看看大家都學什麼
            </Button>
          </Box>
        </SubBannerWrapper>
      </BannerWrapper>
      <BannerVideo />
    </Box>
  );
};

export default Banner;
